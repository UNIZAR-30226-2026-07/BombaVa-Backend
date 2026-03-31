/**
 * Diversos DAOs para el acceso de datos
 */
import { ShipTemplate, UserShip, WeaponTemplate } from '../../../shared/models/index.js';

export const findUserShips = async (userId) => {
    return await UserShip.findAll({
        where: { userId },
        include: [{ model: ShipTemplate }, { model: WeaponTemplate }]
    });
};

export const findByIdAndUser = async (shipId, userId) => {
    return await UserShip.findOne({ where: { id: shipId, userId } });
};

export const associateShip = async (userId, shipType) => {
    return await UserShip.create({ userId: userId, templateSlug: shipType });
};

export const updateShipStats = async (ship, stats) => {
    ship.customStats = { ...ship.customStats, ...stats };
    return await ship.save();
};

export const findUserShipsWithWeapons = async (userId) => {
    return await UserShip.findAll({
        where: { userId },
        include: [{ model: ShipTemplate }, { model: WeaponTemplate }]
    });
};

export const addWeaponToShip = async (shipInstance, weaponSlug) => {
    return await shipInstance.addWeaponTemplate(weaponSlug);
};

export const removeWeaponFromShip = async (shipInstance, weaponSlug) => {
    return await shipInstance.removeWeaponTemplate(weaponSlug);
};

export const findByIdWithWeapons = async (shipId, userId) => {
    return await UserShip.findOne({
        where: { id: shipId, userId },
        include: [WeaponTemplate]
    });
};

export const getUserShipHp = async (userShipId) => {
    const userShip = await UserShip.findByPk(userShipId, {
        include: [{ model: ShipTemplate, attributes: ['baseMaxHp'] }]
    });
    return userShip.ShipTemplate.baseMaxHp;
};