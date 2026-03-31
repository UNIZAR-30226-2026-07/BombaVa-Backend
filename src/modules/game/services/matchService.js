/**
 * Servicio de Gestión de Partidas
 */
import { GAME_RULES } from '../../../config/gameRules.js';
import { EngineDao } from '../../engine/dao/index.js';
import { InventoryDao } from '../../inventory/dao/index.js';
import { MatchDao } from '../dao/index.js';
import { generarSnapshotVision } from './visionService.js';

export { traducirOrientacion, traducirPosicionTablero } from './boardUtils.js';

export const instanciarFlotaEnPartida = async (matchId, playerId, bando, configuracionMazo) => {
    const shipList = [];
    for (const shipCfg of configuracionMazo) {
        const userShip = await InventoryDao.findByIdAndUser(shipCfg.userShipId, playerId);
        const posAbs = bando === 'NORTH' ? shipCfg.position : { x: shipCfg.position.x, y: (GAME_RULES.MAP.SIZE - 1) - shipCfg.position.y };
        const orientation = bando === 'NORTH' ? shipCfg.orientation : 'S';

        shipList.push({
            matchId: matchId, 
            playerId: playerId, 
            userShipId: userShip.id,
            x: posAbs.x,
            y: posAbs.y,
            orientation,
            currentHp: await InventoryDao.getUserShipHp(userShip.id),
            isSunk: false
        });
    }
    await EngineDao.createFleet(shipList);
};


export const iniciarPartidaOrquestada = async (usuarios) => {
    const nuevaPartida = await MatchDao.createMatch(usuarios[0].id);
    for (let i = 0; i < usuarios.length; i++) {
        const user = usuarios[i];
        const mazo = await InventoryDao.findUserActiveDecks(user.id);
        const bando = (i === 0) ? 'NORTH' : 'SOUTH';

        await MatchDao.createPlayer(nuevaPartida.id, user.id, bando, mazo ? mazo.shipIds : []);
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
        fuel: GAME_RULES.RESOURCES.RESET_FUEL,
        ammo: GAME_RULES.RESOURCES.RESET_AMMO
    };
};

/**
 * Genera la visión actual del tablero para un jugador.
 */
export const obtenerEstadoCompletoPartida = async (matchId, userId) => {
    const match = await MatchDao.findById(matchId);
    const jugador = await MatchDao.findMatchPlayer(matchId, userId);
    const vision = await generarSnapshotVision(matchId, userId);

    return {
        matchInfo: {
            matchId: match.id,
            status: match.status,
            currentTurnPlayer: match.currentTurnPlayerId,
            yourId: userId,
            turnNumber: match.turnNumber,
            mapTerrain: match.mapTerrain
        },
        ammo: jugador.ammoCurrent,
        fuel: jugador.fuelReserve,
        playerFleet: vision.myFleet,
        enemyFleet: vision.visibleEnemyFleet 
    };
};

/**
 * Recupera el historial de un usuario
 * @param {string} userId 
 */
export const obtenerHistorialUsuario = async (userId) => {
    return await MatchDao.searchAllMatchesFromUser(userId);
};

/**
 * Notifica a todos los jugadores de la sala su visión actualizada de forma asíncrona
 */
export const notificarVisionSala = async (io, matchId) => {
    const socketsEnSala = await io.in(matchId).fetchSockets();
    const promesas = socketsEnSala.map(async (s) => {
        const vision = await generarSnapshotVision(matchId, s.data.user.id);
        s.emit('match:vision_update', vision);
    });
    await Promise.all(promesas);
};