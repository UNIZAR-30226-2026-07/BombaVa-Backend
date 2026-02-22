import { Match, MatchPlayer, Projectile, ShipInstance, ShipTemplate, UserShip } from '../../../shared/models/index.js';

/**
 * Recupera el estado completo de una partida para la API
 */
export const obtenerEstadoCompletoPartida = async (matchId) => {
    return await Match.findByPk(matchId, {
        include: [{ model: MatchPlayer }, { model: ShipInstance }, { model: Projectile }]
    });
};

/**
 * Recupera el historial de un usuario
 */
export const obtenerHistorialUsuario = async (userId) => {
    return await Match.findAll({
        include: [{ model: MatchPlayer, where: { userId: userId } }],
        order: [['created_at', 'DESC']]
    });
};

export const traducirPosicionTablero = (pos, bando) => {
    return bando === 'NORTH' ? pos : { x: pos.x, y: 14 - pos.y };
};

export const instanciarFlotaEnPartida = async (matchId, playerId, bando, shipConfigs) => {
    for (const config of shipConfigs) {
        const userShip = await UserShip.findByPk(config.userShipId, { include: [{ model: ShipTemplate }] });
        const hpActual = userShip?.ShipTemplate?.baseMaxHp || 10;
        const posAbs = traducirPosicionTablero(config.position, bando);

        await ShipInstance.create({
            matchId, playerId, userShipId: config.userShipId,
            x: posAbs.x, y: posAbs.y, currentHp: hpActual,
            orientation: bando === 'NORTH' ? config.orientation : 'S'
        });
    }
};

export const calcularRegeneracionTurno = (actual) => {
    return { fuel: Math.min(30, actual.fuel + 10), ammo: 5 };
};