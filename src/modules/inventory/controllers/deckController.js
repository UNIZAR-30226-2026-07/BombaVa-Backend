/**
 * Controlador de Mazos
 * Gestiona la creación y activación de formaciones de flota, aplicando validaciones de seguridad.
 */
import { validationResult } from 'express-validator';
import InventoryDao from '../dao/InventoryDao.js';
import * as inventoryService from '../services/inventoryService.js';

export const createDeck = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
        const { deckName, shipIds } = req.body;

        if (!inventoryService.validarLimitesPuerto(shipIds)) {
            return res.status(400).json({ message: 'Barcos fuera de los límites del puerto (15x5)' });
        }

        for (const ship of shipIds) {
            const ownsShip = await InventoryDao.findByIdAndUser(ship.userShipId, req.user.id);
            if (!ownsShip) {
                return res.status(403).json({ message: `Acceso denegado. El barco ${ship.userShipId} no te pertenece.` });
            }
        }

        const nuevoMazo = await InventoryDao.createDeck({
            userId: req.user.id,
            deckName,
            shipIds,
            isActive: false
        });

        res.status(201).json(nuevoMazo);
    } catch (error) {
        next(error);
    }
};

export const setActiveDeck = async (req, res, next) => {
    try {
        const { deckId } = req.params;
        const mazo = await InventoryDao.activateDeck(deckId, req.user.id);

        if (!mazo) return res.status(404).json({ message: 'Mazo no encontrado' });

        res.json({ message: 'Mazo activado correctamente', deck: mazo });
    } catch (error) {
        next(error);
    }
};

export const getMyDecks = async (req, res, next) => {
    try {
        const mazos = await InventoryDao.findUserDecks(req.user.id);
        res.json(mazos);
    } catch (error) {
        next(error);
    }
};