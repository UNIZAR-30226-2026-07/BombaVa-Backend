/**
 * Servicio de Inventario y Puerto
 * Contiene la lógica de validación de formaciones y equipamiento.
 */
import InventoryDao from '../dao/InventoryDao.js';

/**
 * Valida que los barcos estén dentro del área de despliegue (15x5)
 * @param {Array} formation - Array de barcos con sus posiciones
 */
export const validarLimitesPuerto = (formation) => {
    const MAX_X = 14;
    const MAX_Y = 4; // V1: Tablero de despliegue es 15x5 (0-4)

    return formation.every(ship =>
        ship.position.x >= 0 && ship.position.x <= MAX_X &&
        ship.position.y >= 0 && ship.position.y <= MAX_Y
    );
};

/**
 * Actualiza el equipamiento de un barco
 * @param {Object} ship - Instancia de UserShip
 * @param {string} weaponSlug - Identificador del arma
 */
export const equiparArma = async (ship, weaponSlug) => {
    const statsActuales = ship.customStats || {};
    return await InventoryDao.updateShipStats(ship, {
        ...statsActuales,
        equippedWeapon: weaponSlug
    });
    // TODO: añadir logica de armas
};