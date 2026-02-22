/**
 * Servicio de Inventario y Puerto
 * Contiene la lógica de validación de formaciones y equipamiento.
 */
import { GAME_RULES } from '../../../config/gameRules.js';
import InventoryDao from '../dao/InventoryDao.js';

/**
 * Valida que los barcos estén dentro del área de despliegue usando GAME_RULES
 * @param {Array} formation 
 */
export const validarLimitesPuerto = (formation) => {
    const MAX_X = GAME_RULES.MAP.SIZE - 1;
    const MAX_Y = GAME_RULES.MAP.DEPLOY_ZONE_Y;

    return formation.every(ship =>
        ship.position.x >= 0 && ship.position.x <= MAX_X &&
        ship.position.y >= 0 && ship.position.y <= MAX_Y
    );
};

/**
 * Actualiza el equipamiento de un barco
 * @param {Object} ship 
 * @param {string} weaponSlug 
 */
export const equiparArma = async (ship, weaponSlug) => {
    const statsActuales = ship.customStats || {};
    return await InventoryDao.updateShipStats(ship, {
        ...statsActuales,
        equippedWeapon: weaponSlug
    });
};