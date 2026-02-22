/**
 * Servicio de Gestión de Partidas
 * Orquesta la creación, recuperación de estados y lógica de recursos.
 */
import { FleetDeck, Match, MatchPlayer, Projectile, ShipInstance, ShipTemplate, UserShip } from '../../../shared/models/index.js';

/**
 * Traduce coordenadas relativas del puerto a absolutas del mapa de batalla
 */
export const traducirPosicionTablero = (pos, bando) => {
    return bando === 'NORTH' ? pos : { x: pos.x, y: 14 - pos.y };
};

/**
 * Crea las instancias físicas de los barcos en el tablero
 */
export const instanciarFlotaEnPartida = async (matchId, playerId, bando, configuracionMazo) => {
    for (const shipCfg of configuracionMazo) {
        const userShip = await UserShip.findByPk(shipCfg.userShipId, {
            include: [ShipTemplate]
        });

        const posAbs = traducirPosicionTablero(shipCfg.position, bando);
        const orientation = (bando === 'NORTH') ? shipCfg.orientation : 'S';

        await ShipInstance.create({
            matchId, playerId, userShipId: userShip.id,
            x: posAbs.x, y: posAbs.y, orientation,
            currentHp: userShip.ShipTemplate.baseMaxHp,
            isSunk: false
        });
    }
};

/**
 * Orquestador principal para iniciar una partida desde cero (Movido desde el controlador)
 * @param {Array} usuarios - Lista de {id, socketId}
 */
export const iniciarPartidaOrquestada = async (usuarios) => {
    const nuevaPartida = await Match.create({
        status: 'PLAYING',
        mapTerrain: { size: 15, obstacles: [] },
        turnNumber: 1,
        currentTurnPlayerId: usuarios[0].id // El primero en unirse empieza
    });

    for (let i = 0; i < usuarios.length; i++) {
        const user = usuarios[i];
        const mazo = await FleetDeck.findOne({ where: { userId: user.id, isActive: true } });
        const bando = (i === 0) ? 'NORTH' : 'SOUTH';

        await MatchPlayer.create({
            matchId: nuevaPartida.id,
            userId: user.id,
            side: bando,
            fuelReserve: 10,
            ammoCurrent: 5,
            deckSnapshot: mazo ? mazo.shipIds : []
        });

        if (mazo && mazo.shipIds) {
            await instanciarFlotaEnPartida(nuevaPartida.id, user.id, bando, mazo.shipIds);
        }
    }

    return nuevaPartida;
};

/**
 * Calcula la regeneración de recursos al inicio del turno
 */
export const calcularRegeneracionTurno = (recursosActuales) => {
    return {
        fuel: Math.min(30, recursosActuales.fuel + 10),
        ammo: 5
    };
};

/**
 * Recupera el estado completo de una partida
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
        include: [{ model: MatchPlayer, where: { userId } }],
        order: [['created_at', 'DESC']]
    });
};