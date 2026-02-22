import { ShipInstance, ShipTemplate, UserShip } from '../../../shared/models/index.js';

/**
 * Traduce la posición del mini-tablero a coordenadas absolutas del mapa de batalla
 * @param {object} pos - {x, y} relativa
 * @param {string} bando - NORTH | SOUTH
 * @returns {object} {x, y} absoluta
 */
export const traducirPosicionTablero = (pos, bando) => {
    if (bando === 'NORTH') return { x: pos.x, y: pos.y };
    return { x: pos.x, y: 14 - pos.y };
};

/**
 * Calcula la orientación inicial según el bando
 * @param {string} ori - Orientación original
 * @param {string} bando - NORTH | SOUTH
 * @returns {string}
 */
export const traducirOrientacionTablero = (ori, bando) => {
    return bando === 'NORTH' ? ori : 'S';
};

/**
 * Lógica para crear las instancias físicas de los barcos en una partida
 * @param {string} matchId - ID de la partida
 * @param {string} playerId - ID del dueño
 * @param {string} bando - NORTH | SOUTH
 * @param {Array} shipConfigs - Lista de barcos del mazo
 */
export const instanciarFlotaEnPartida = async (matchId, playerId, bando, shipConfigs) => {
    for (const config of shipConfigs) {
        const userShip = await UserShip.findByPk(config.userShipId, {
            include: [{ model: ShipTemplate }]
        });

        const hpActual = userShip?.ShipTemplate?.baseMaxHp || 10;
        const posAbsoluta = traducirPosicionTablero(config.position, bando);

        await ShipInstance.create({
            matchId,
            playerId,
            userShipId: config.userShipId,
            x: posAbsoluta.x,
            y: posAbsoluta.y,
            orientation: traducirOrientacionTablero(config.orientation, bando),
            currentHp: hpActual
        });
    }
};

/**
 * Reglas de regeneración de recursos para el inicio de turno
 * @param {object} actual - Estado de recursos antes de regenerar
 * @returns {object}
 */
export const calcularRegeneracionTurno = (actual) => {
    return {
        fuel: Math.min(30, actual.fuel + 10),
        ammo: 5
    };
};