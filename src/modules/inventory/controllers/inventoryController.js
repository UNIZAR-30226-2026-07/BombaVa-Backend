import { validationResult } from 'express-validator';
import InventoryDao from '../dao/InventoryDao.js';

/**
 * Lista los barcos en propiedad del usuario logueado
 * @param {object} req 
 * @param {object} res 
 * @param {function} next 
 */
export const getMyShips = async (req, res, next) => {
    try {
        const ships = await InventoryDao.findUserShips(req.user.id);
        res.json(ships);
    } catch (error) {
        next(error);
    }
};

/**
 * Equipa un arma en el slot del barco
 * @param {object} req 
 * @param {object} res 
 * @param {function} next 
 */
export const equipWeapon = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { shipId } = req.params;
        const { weaponSlug } = req.body;

        const ship = await InventoryDao.findByIdAndUser(shipId, req.user.id);

        if (!ship) {
            return res.status(404).json({ message: 'Barco no encontrado en tu inventario' });
        }

        const updatedShip = await InventoryDao.updateShipStats(ship, { equippedWeapon: weaponSlug });

        res.json(updatedShip);
    } catch (error) {
        next(error);
    }
};

/**
 * Lista todos los mazos de flota del usuario
 * @param {object} req 
 * @param {object} res 
 * @param {function} next 
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
 * Crea una nueva configuración de mazo (Mini-tablero 5x15)
 * @param {object} req 
 * @param {object} res 
 * @param {function} next 
 */
export const createDeck = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { deckName, shipIds } = req.body;

        for (const shipConfig of shipIds) {
            if (shipConfig.position.x < 0 || shipConfig.position.x > 14 ||
                shipConfig.position.y < 0 || shipConfig.position.y > 4) {
                return res.status(400).json({ message: 'Posición de despliegue fuera de límites (5x15)' });
            }
        }

        const newDeck = await InventoryDao.createDeck({
            user_id: req.user.id,
            deckName,
            shipIds,
            isActive: false
        });

        res.status(201).json(newDeck);
    } catch (error) {
        next(error);
    }
};

/**
 * Establece un mazo como activo para el matchmaking
 * @param {object} req 
 * @param {object} res 
 * @param {function} next 
 */
export const setActiveDeck = async (req, res, next) => {
    try {
        const { deckId } = req.params;
        const deck = await InventoryDao.activateDeck(deckId, req.user.id);

        if (!deck) {
            return res.status(404).json({ message: 'Mazo no encontrado' });
        }

        res.json({ message: 'Mazo activado correctamente', deck });
    } catch (error) {
        next(error);
    }
};