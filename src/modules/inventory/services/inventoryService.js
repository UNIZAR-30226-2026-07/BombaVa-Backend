/**
 * Lógica de negocio para la gestión de inventario y puerto
 */

/**
 * Valida si la formación de barcos entra dentro del mini-tablero de despliegue
 * @param {Array} shipIds - Configuración de barcos y posiciones
 * @param {object} dimensiones - Dimensiones del tablero (V1: 15x5)
 * @returns {boolean}
 */
export const validarDimensionesMazo = (shipIds, dimensiones = { x: 15, y: 5 }) => {
    return shipIds.every(conf =>
        conf.position.x >= 0 && conf.position.x < dimensiones.x &&
        conf.position.y >= 0 && conf.position.y < dimensiones.y
    );
};

export const equiparArmaEnBarco = async (barco, weaponSlug) => {
    // TODO: añadir lógica de compatibilidad de armas
    return await InventoryDao.updateShipStats(barco, { equippedWeapon: weaponSlug });
};