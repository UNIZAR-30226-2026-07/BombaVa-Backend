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