/**
 * Servicio de Gestión de Partidas
 * Orquesta la creación, recuperación de estados y lógica de recursos.
 */
import { GAME_RULES } from '../../../config/gameRules.js';
import {InventoryDao} from '../../inventory/dao/index.js';
import {MatchDao} from '../dao/index.js';
import {EngineDao} from '../../engine/dao/index.js';
/**
 * Traduce coordenadas relativas del puerto a absolutas del mapa de batalla
 * @param {Object} pos 
 * @param {string} bando 
 */
export const traducirPosicionTablero = (pos, bando) => {
    return bando === 'NORTH' ? pos : { x: pos.x, y: (GAME_RULES.MAP.SIZE - 1) - pos.y };
};

/**
 * Traduce la direccion que apunta un barco dependiendo de su bando
 * @param {string} orientacion 
 * @param {string} bando 
 * @returns {string} La nueva orentacion traducida
 */
export const traducirOrientacion = (orientacion, bando) => {
    if (bando === 'NORTH') return orientacion;
    const opuestos = { 'N': 'S', 'S': 'N', 'E': 'E', 'W': 'W' };
    return opuestos[orientacion] || orientacion;
};

/**
 * Crea las instancias físicas de los barcos en el tablero
 * @param {string} matchId 
 * @param {string} playerId 
 * @param {string} bando 
 * @param {Array} configuracionMazo 
 */
export const instanciarFlotaEnPartida = async (matchId, playerId, bando, configuracionMazo) => {
    const shipList = [];
    for (const shipCfg of configuracionMazo) {
        const userShip = await InventoryDao.findByIdAndUser(shipCfg.userShipId, playerId);
        const posAbs =  traducirPosicionTablero(shipCfg.position, bando);
        const orientation = (bando === 'NORTH') ? shipCfg.orientation : 'S';

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
    EngineDao.createFleet(shipList);
};

/**
 * Orquestador principal para iniciar una partida desde cero
 * @param {Array} usuarios 
 */
export const iniciarPartidaOrquestada = async (usuarios) => {

    const nuevaPartida = await MatchDao.createMatch();

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
        fuel: Math.min(GAME_RULES.RESOURCES.MAX_FUEL, recursosActuales.fuel + GAME_RULES.RESOURCES.REGEN_FUEL),
        ammo: GAME_RULES.RESOURCES.RESET_AMMO
    };
};

/**
 * Recupera el estado completo de una partida
 * @param {UUID} matchId El id de la partid
 * @param {UUID} userId El id del usuario
 */
export const obtenerEstadoCompletoPartida = async (matchId, userId) => {
    const match = await MatchDao.findById(matchId);
    const matchInfo = await EngineDao.findByMatchAndPlayer(matchId, userId);
    const jugador = await MatchDao.findMatchPlayer(matchId, userId);
    const bando = jugador.side;
    //Borrar elementos que no sirve para el cliente
    const barcosLimpios = matchInfo.map(barco => {
        // Traducir info del juagdor si es del bando norte para que tenga vista desde sur
        const posTraducida = traducirPosicionTablero({ x: barco.x, y: barco.y }, bando);
        const orientacionTraducida = traducirOrientacion(barco.orientation, bando);
        const hitCellsTraducidas = barco.hitCells 
            ? barco.hitCells.map(hit => traducirPosicionTablero(hit, bando))
            : [];

        return {
            id: barco.id,
            x: posTraducida.x,
            y: posTraducida.y,
            orientation: orientacionTraducida,
            currentHp: barco.currentHp,
            hitCells: hitCellsTraducidas,
            isSunk: barco.isSunk
        };
    });
    const partidaLimpio = ({
        matchId: match.id,
        status: match.status,
        currentTurnPlayer: match.currentTurnPlayerId,
        turnNumber: match.turnNumber,
        mapTerrain: match.mapTerrain
    });
    const payload = {
        matchInfo: partidaLimpio,
        playerFleet: barcosLimpios
    };
    return payload;
};

/**
 * Recupera el historial de un usuario
 * @param {string} userId 
 */
export const obtenerHistorialUsuario = async (userId) => {
    return await MatchDao.searchAllMatchesFromUser(userId);
};