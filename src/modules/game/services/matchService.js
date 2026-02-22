/**
 * Servicio de Gestión de Partidas
 * Maneja la recuperación de estados, historial y lógica de recursos.
 */
import { Match, MatchPlayer, Projectile, ShipInstance, ShipTemplate, UserShip } from '../../../shared/models/index.js';

/**
 * Recupera el estado completo de una partida para la API
 * @param {string} matchId - UUID de la partida
 */
export const obtenerEstadoCompletoPartida = async (matchId) => {
    return await Match.findByPk(matchId, {
        include: [{ model: MatchPlayer }, { model: ShipInstance }, { model: Projectile }]
    });
};

/**
 * Recupera el historial de un usuario
 * @param {string} userId - UUID del usuario
 */
export const obtenerHistorialUsuario = async (userId) => {
    return await Match.findAll({
        include: [{ model: MatchPlayer, where: { userId } }],
        order: [['created_at', 'DESC']]
    });
};

/**
 * Traduce coordenadas relativas del puerto a absolutas del mapa de batalla
 * @param {Object} pos - {x, y}
 * @param {string} bando - 'NORTH' | 'SOUTH'
 */
export const traducirPosicionTablero = (pos, bando) => {
    return bando === 'NORTH' ? pos : { x: pos.x, y: 14 - pos.y };
};

/**
 * Calcula la regeneración de recursos al inicio del turno
 * @param {Object} recursosActuales - { fuel, ammo }
 */
export const calcularRegeneracionTurno = (recursosActuales) => {
    return {
        fuel: Math.min(30, recursosActuales.fuel + 10),
        ammo: 5
    };
};

/**
 * Crea las instancias físicas de los barcos en el tablero basándose en el mazo activo
 * @param {string} matchId - UUID de la partida
 * @param {string} playerId - UUID del jugador
 * @param {string} bando - 'NORTH' | 'SOUTH'
 * @param {Array} configuracionMazo - Lista de {userShipId, position, orientation}
 */
export const instanciarFlotaEnPartida = async (matchId, playerId, bando, configuracionMazo) => {
    for (const shipCfg of configuracionMazo) {
        const userShip = await UserShip.findByPk(shipCfg.userShipId, {
            include: [ShipTemplate]
        });

        const posAbs = traducirPosicionTablero(shipCfg.position, bando);
        const orientation = (bando === 'NORTH') ? shipCfg.orientation : 'S';

        await ShipInstance.create({
            matchId,
            playerId,
            userShipId: userShip.id,
            x: posAbs.x,
            y: posAbs.y,
            orientation,
            currentHp: userShip.ShipTemplate.baseMaxHp,
            isSunk: false
        });
    }
};