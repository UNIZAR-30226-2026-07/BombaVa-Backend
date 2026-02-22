import { validationResult } from 'express-validator';
import InventoryDao from '../dao/InventoryDao.js';
import * as inventoryService from '../services/inventoryService.js';

/**
 * Obtiene los mazos configurados por el usuario
 * @param {object} req - Petición Express
 * @param {object} res - Respuesta Express
 * @param {function} next - Middleware de error
 */
export const getMyDecks = async (req, res, next) => {
    try {
        const mazos = await InventoryDao.findUserDecks(req.user.id);
        res.json(mazos);
    } catch (error) {
        next(error);
    }
};

/**
 * Registra un mazo delegando la validación de posición al servicio de inventario
 * @param {object} req - Petición Express
 * @param {object} res - Respuesta Express
 * @param {function} next - Middleware de error
 */
export const createDeck = async (req, res, next) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) return res.status(400).json({ errors: errores.array() });

    try {
        const { deckName, shipIds } = req.body;

        if (!inventoryService.validarDimensionesMazo(shipIds)) {
            return res.status(400).json({ message: 'La formación de barcos excede el área de despliegue' });
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

/**
 * Marca un mazo como activo mediante el DAO
 * @param {object} req - Petición Express
 * @param {object} res - Respuesta Express
 * @param {function} next - Middleware de error
 */
export const setActiveDeck = async (req, res, next) => {
    try {
        const { deckId } = req.params;
        const mazo = await InventoryDao.activateDeck(deckId, req.user.id);

        if (!mazo) return res.status(404).json({ message: 'Mazo no encontrado' });

        res.json({ message: 'Mazo activado con éxito', deck: mazo });
    } catch (error) {
        next(error);
    }
};