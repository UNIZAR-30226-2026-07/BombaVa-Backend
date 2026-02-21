import { validationResult } from 'express-validator';
import InventoryDao from '../dao/InventoryDao.js';

/**
 * Recupera la lista de barcos del usuario autenticado
 * @param {object} req - Petición de Express
 * @param {object} res - Respuesta de Express
 * @param {function} next - Middleware de error
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
 * Modifica el armamento equipado de un barco
 * @param {object} req - Petición con shipId y weaponSlug
 * @param {object} res - Respuesta con datos actualizados
 * @param {function} next - Middleware de error
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
            return res.status(404).json({ message: 'Barco no encontrado' });
        }

        const updatedShip = await InventoryDao.updateShipStats(ship, { equippedWeapon: weaponSlug });

        res.json(updatedShip);
    } catch (error) {
        next(error);
    }
};