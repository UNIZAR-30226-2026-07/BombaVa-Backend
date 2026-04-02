/**
 * Controlador de Mazos
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

        const sonPropios = await inventoryService.verificarPropiedadBarcos(req.user.id, shipIds);
        if (!sonPropios) {
            return res.status(403).json({ message: 'Uno o más barcos no te pertenecen o no existen' });
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

/**
 * Actualiza la formación de barcos o el nombre de un mazo
 */
export const updateDeck = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
        const { deckId } = req.params;
        const { deckName, shipIds } = req.body;

        // Si se están cambiando los barcos, validamos que estén en la zona 15x5
        if (shipIds && !inventoryService.validarLimitesPuerto(shipIds)) {
            return res.status(400).json({ message: 'Barcos fuera de los límites del puerto (15x5)' });
        }

        const sonPropios = await inventoryService.verificarPropiedadBarcos(req.user.id, shipIds);
        if (!sonPropios) {
            return res.status(403).json({ message: 'Uno o más barcos no te pertenecen o no existen' });
        }

        const mazoActualizado = await InventoryDao.updateDeck(deckId, req.user.id, {
            deckName,
            shipIds
        });

        if (!mazoActualizado) return res.status(404).json({ message: 'Mazo no encontrado' });

        res.json(mazoActualizado);
    } catch (error) {
        next(error);
    }
};

/**
 * Elimina un mazo si no es el único que tiene el usuario
 */
export const deleteDeck = async (req, res, next) => {
    try {
        const { deckId } = req.params;
        const userId = req.user.id;

        const totalMazos = await InventoryDao.countUserDecks(userId);
        
        if (totalMazos <= 1) {
            return res.status(400).json({ 
                message: 'No puedes eliminar tu único mazo. Debes tener al menos una formación configurada.' 
            });
        }

        const eliminado = await InventoryDao.deleteDeck(deckId, userId);
        
        if (!eliminado) return res.status(404).json({ message: 'Mazo no encontrado' });

        res.json({ message: 'Mazo eliminado correctamente' });
    } catch (error) {
        next(error);
    }
};