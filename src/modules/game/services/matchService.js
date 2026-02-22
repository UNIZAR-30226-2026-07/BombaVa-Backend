/**
 * Servicio de Gestión de Partidas
 * Maneja la recuperación de estados, historial y lógica de recursos.
 */
import { Match, MatchPlayer, Projectile, ShipInstance, ShipTemplate, UserShip } from '../../../shared/models/index.js';

export const obtenerEstadoCompletoPartida = async (matchId) => {
    return await Match.findByPk(matchId, {
        include: [{ model: MatchPlayer }, { model: ShipInstance }, { model: Projectile }]
    });
};

export const obtenerHistorialUsuario = async (userId) => {
    return await Match.findAll({
        include: [{ model: MatchPlayer, where: { userId } }],
        order: [['created_at', 'DESC']]
    });
};

/**
 * Traduce coordenadas relativas a absolutas según el bando
 */
export const traducirPosicionTablero = (pos, bando) => {
    return bando === 'NORTH' ? pos : { x: pos.x, y: 14 - pos.y };
};

export const calcularRegeneracionTurno = (recursosActuales) => {
    return {
        fuel: Math.min(30, recursosActuales.fuel + 10),
        ammo: 5
    };
};

export const instanciarBarcosEnPartida = async (matchId, playerId, bando, configuracionMazo, transaccion) => {
    for (const shipCfg of configuracionMazo) {
        const userShip = await UserShip.findByPk(shipCfg.userShipId, {
            include: [ShipTemplate],
            transaction: transaccion
        });

        const posAbs = traducirPosicionTablero(shipCfg.position, bando);
        const orientation = (bando === 'NORTH') ? shipCfg.orientation : 'S';

        await ShipInstance.create({
            matchId, playerId, userShipId: userShip.id,
            x: posAbs.x, y: posAbs.y, orientation,
            currentHp: userShip.ShipTemplate.baseMaxHp,
            isSunk: false
        }, { transaction: transaccion });
    }
};