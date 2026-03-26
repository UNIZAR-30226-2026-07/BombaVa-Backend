/**
 * Controlador de Inventario
 */
import { validationResult } from 'express-validator';
import InventoryDao from '../dao/InventoryDao.js';
import WeaponTemplateDao from '../dao/WeaponTemplateDao.js';

/**
 * Devuelve un listado de barcos del usuario, con sus armas
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
 * Equipa un arma a un barco de un usuario. Se asegura que el barco y el arma exista 
 */
export const equipWeapon = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
        const { shipId } = req.params;
        const { weaponSlug } = req.body;

        const ship = await InventoryDao.findByIdAndUser(shipId, req.user.id);
        if (!ship) {
            return res.status(404).json({ message: 'Barco no encontrado' });
        }
        const weapon = await WeaponTemplateDao.findBySlug(weaponSlug);
        if (!weapon) {
            return res.status(404).json({ message: 'Arma no encontrada' });
        }
        await InventoryDao.addWeaponToShip(ship, weaponSlug);
        const updatedShip = await InventoryDao.findByIdWithWeapons(shipId, req.user.id);

        res.json(updatedShip);
    } catch (error) {
        next(error);
    }
};

/**
 * Deuelve el listado de armas disponibles
 */
export const showAllWeapons = async (req, res, next) =>{
    try{
        const weapons = await WeaponTemplateDao.findAll();
        res.json(weapons);
    } catch (error) {
        next(error);
    }
};

/**
 * Elimina un arma a un barco de un usuario. Se asegura que el barco y el arma exista 
 */
export const removeWeaponFromShip = async(req, res, next) =>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
        const { shipId, weaponSlug } = req.params;

        const ship = await InventoryDao.findByIdAndUser(shipId, req.user.id);
        if (!ship) {
            return res.status(404).json({ message: 'Barco no encontrado' });
        }
        const weapon = await WeaponTemplateDao.findBySlug(weaponSlug);
        if (!weapon) {
            return res.status(404).json({ message: 'Arma no encontrada' });
        }
        await InventoryDao.removeWeaponFromShip(ship, weaponSlug);
        const updatedShip = await InventoryDao.findByIdWithWeapons(shipId, req.user.id);

        res.json(updatedShip);
    } catch (error) {
        next(error);
    }
}