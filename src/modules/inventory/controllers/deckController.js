import { validationResult } from 'express-validator';
import InventoryDao from '../dao/InventoryDao.js';

/**
 * Obtiene los mazos configurados por el usuario
 * @param {object} req - Petición Express
 * @param {object} res - Respuesta Express
 * @param {function} next - Middleware de error
 */
export const getMyDecks = async (req, res, next) => {
    try {
        const decks = await InventoryDao.findUserDecks(req.user.id);
        res.json(decks);
    } catch (error) {
        next(error);
    }
};

/**
 * Registra un mazo validando las posiciones del mini-tablero 5x15
 * @param {object} req - Petición con configuración de mazo
 * @param {object} res - Respuesta Express
 */
export const createDeck = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
        const { deckName, shipIds } = req.body;

        for (const conf of shipIds) {
            if (conf.position.x < 0 || conf.position.x > 14 || conf.position.y < 0 || conf.position.y > 4) {
                return res.status(400).json({ message: 'Posición fuera de límites (5x15)' });
            }
        }

        const newDeck = await InventoryDao.createDeck({
            userId: req.user.id, deckName, shipIds, isActive: false
        });

        res.status(201).json(newDeck);
    } catch (error) {
        next(error);
    }
};

/**
 * Marca un mazo como activo para el combate
 * @param {object} req - Petición con deckId
 * @param {object} res - Respuesta Express
 */
export const setActiveDeck = async (req, res, next) => {
    try {
        const { deckId } = req.params;
        const deck = await InventoryDao.activateDeck(deckId, req.user.id);

        if (!deck) return res.status(404).json({ message: 'Mazo no encontrado' });

        res.json({ message: 'Mazo activado', deck });
    } catch (error) {
        next(error);
    }
};