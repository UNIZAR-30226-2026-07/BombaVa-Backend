/**
 * Servicio de Gestión de Partidas
 * Orquesta la creación, recuperación de estados y lógica de recursos.
 */
import { GAME_RULES } from '../../../config/gameRules.js';
import { FleetDeck, Match, MatchPlayer, Projectile, ShipInstance, ShipTemplate, UserShip } from '../../../shared/models/index.js';

/**
 * Traduce coordenadas relativas del puerto a absolutas del mapa de batalla
 * @param {Object} pos 
 * @param {string} bando 
 */
export const traducirPosicionTablero = (pos, bando) => {
    return bando === 'NORTH' ? pos : { x: pos.x, y: (GAME_RULES.MAP.SIZE - 1) - pos.y };
};

/**
 * Crea las instancias físicas de los barcos en el tablero
 * @param {string} matchId 
 * @param {string} playerId 
 * @param {string} bando 
 * @param {Array} configuracionMazo 
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
            x: posAbs.x,
            y: posAbs.y,
            orientation,
            currentHp: userShip.ShipTemplate.baseMaxHp,
            isSunk: false
        });
    }
};

/**
 * Orquestador principal para iniciar una partida desde cero
 * @param {Array} usuarios 
 */
export const iniciarPartidaOrquestada = async (usuarios) => {
    const nuevaPartida = await Match.create({
        status: 'PLAYING',
        mapTerrain: { size: GAME_RULES.MAP.SIZE, obstacles: [] },
        turnNumber: 1,
        currentTurnPlayerId: usuarios[0].id
    });

    for (let i = 0; i < usuarios.length; i++) {
        const user = usuarios[i];
        const mazo = await FleetDeck.findOne({ where: { userId: user.id, isActive: true } });
        const bando = (i === 0) ? 'NORTH' : 'SOUTH';

        await MatchPlayer.create({
            matchId: nuevaPartida.id,
            userId: user.id,
            side: bando,
            fuelReserve: GAME_RULES.RESOURCES.MAX_FUEL / 3,
            ammoCurrent: GAME_RULES.RESOURCES.RESET_AMMO,
            deckSnapshot: mazo ? mazo.shipIds : []
        });

        if (mazo && mazo.shipIds) {
            await instanciarFlotaEnPartida(nuevaPartida.id, user.id, bando, mazo.shipIds);
        }
    }

    return nuevaPartida;
};

/**
 * Calcula la regeneración de recursos al inicio del turno usando GAME_RULES
 * @param {Object} recursosActuales 
 */
export const calcularRegeneracionTurno = (recursosActuales) => {
    return {
        fuel: Math.min(GAME_RULES.RESOURCES.MAX_FUEL, recursosActuales.fuel + GAME_RULES.RESOURCES.REGEN_FUEL),
        ammo: GAME_RULES.RESOURCES.RESET_AMMO
    };
};

/**
 * Recupera el estado completo de una partida
 * @param {string} matchId 
 */
export const obtenerEstadoCompletoPartida = async (matchId) => {
    return await Match.findByPk(matchId, {
        include: [{ model: MatchPlayer }, { model: ShipInstance }, { model: Projectile }]
    });
};

/**
 * Recupera el historial de un usuario
 * @param {string} userId 
 */
export const obtenerHistorialUsuario = async (userId) => {
    return await Match.findAll({
        include: [{ model: MatchPlayer, where: { userId } }],
        order: [['created_at', 'DESC']]
    });
};