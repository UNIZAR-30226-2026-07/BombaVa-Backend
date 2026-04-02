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
    return bando === 'NORTH' ? pos : { x: (GAME_RULES.MAP.SIZE - 1) - pos.x, y: (GAME_RULES.MAP.SIZE - 1) - pos.y };
};

/**
 * Traduce la direccion que apunta un barco dependiendo de su bando
 * @param {string} orientacion 
 * @param {string} bando 
 * @returns {string} La nueva orentacion traducida
 */
export const traducirOrientacion = (orientacion, bando) => {
    if (bando === 'NORTH') return orientacion;
    const opuestos = { 'N': 'S', 'S': 'N', 'E': 'W', 'W': 'E' };
    return opuestos[orientacion] || orientacion;
};

/**
 * Crea las instancias físicas de los barcos en el tablero y congela su armamento
 * @param {string} matchId 
 * @param {string} playerId 
 * @param {string} bando 
 * @param {Array} configuracionMazo 
 */
export const instanciarFlotaEnPartida = async (matchId, playerId, bando, configuracionMazo) => {
    for (const shipCfg of configuracionMazo) {
        const userShip = await InventoryDao.findByIdWithWeapons(shipCfg.userShipId, playerId);
        
        const posAbs = traducirPosicionTablero(shipCfg.position, bando);
        const orientation = (bando === 'NORTH') ? shipCfg.orientation : traducirOrientacion(shipCfg.orientation, 'SOUTH');

        const instance = await EngineDao.createShipInstance({
            matchId: matchId, 
            playerId: playerId, 
            userShipId: userShip.id,
            x: posAbs.x,
            y: posAbs.y,
            orientation,
            currentHp: await InventoryDao.getUserShipHp(userShip.id),
            isSunk: false
        });

        if (userShip.WeaponTemplates && userShip.WeaponTemplates.length > 0) {
            await instance.addCombatWeapons(userShip.WeaponTemplates);
        }
    }
};

/**
 * Orquestador principal para iniciar una partida desde cero
 * @param {Array} usuarios 
 */
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
 * MOCK V1: Devuelve todos los barcos enemigos como visibles.
 */
export const generarSnapshotVision = async (matchId, userId) => {
    const jugador = await MatchDao.findMatchPlayer(matchId, userId);
    const bando = jugador.side;
    
    // Obtenemos todos los barcos del tablero
    const todosLosBarcos = await EngineDao.findByMatchId(matchId);
    const misBarcosRaw = todosLosBarcos.filter(b => b.playerId === userId);
    const enemigosRaw = todosLosBarcos.filter(b => b.playerId !== userId);

    // TODO (V2): Aquí irá la función que calcula el tablero visible: calcularVision(misBarcosRaw, enemigosRaw)
    // Para la V1, el MOCK asume que todos los enemigos son visibles
    const enemigosVisiblesRaw = enemigosRaw; 

    const limpiarYTraducir = async (barcos) => {
        const promesas = barcos.map(async (barco) => {
            const posTraducida = traducirPosicionTablero({ x: barco.x, y: barco.y }, bando);
            const orientacionTraducida = traducirOrientacion(barco.orientation, bando);
            const hitCellsTraducidas = barco.hitCells 
                ? barco.hitCells.map(hit => traducirPosicionTablero(hit, bando))
                : [];
            
            // Ponemos el await para que espere al DAO
            const tamano = await obtenerTamanoEfectiva(barco);
            
            return {
                id: barco.id,
                x: posTraducida.x,
                y: posTraducida.y,
                orientation: orientacionTraducida,
                currentHp: barco.currentHp,
                hitCells: hitCellsTraducidas,
                isSunk: barco.isSunk,
                efectiveWidth: tamano.effectiveWidth,
                effectiveHeight: tamano.effectiveHeight
            };
        });
        return Promise.all(promesas);
    };

    return {
        myFleet: await limpiarYTraducir(misBarcosRaw),
        visibleEnemyFleet: await limpiarYTraducir(enemigosVisiblesRaw)
    };
};


/**
 * Recupera el estado completo de una partida
 * @param {UUID} matchId El id de la partid
 * @param {UUID} userId El id del usuario
 */
/**
 * Recupera el estado completo de una partida
 * @param {UUID} matchId El id de la partida
 * @param {UUID} userId El id del usuario
 */
export const obtenerEstadoCompletoPartida = async (matchId, userId) => {
    const match = await MatchDao.findById(matchId);
    const jugador = await MatchDao.findMatchPlayer(matchId, userId);
    
    // Usamos el nuevo sistema de visión para obtener las flotas
    const vision = await generarSnapshotVision(matchId, userId);
    const partidaLimpio = ({
        matchId: match.id,
        status: match.status,
        currentTurnPlayer: match.currentTurnPlayerId,
        yourId: userId,
        turnNumber: match.turnNumber,
        mapTerrain: match.mapTerrain
    });
    
    const payload = {
        matchInfo: partidaLimpio,
        ammo: jugador.ammoCurrent,
        fuel: jugador.fuelReserve,
        playerFleet: vision.myFleet,
        enemyFleet: vision.visibleEnemyFleet // Añadido para que el cliente vea al enemigo al entrar
    };
    console.log(payload);
    return payload;
};

/**
 * Recupera el historial de un usuario
 * @param {string} userId 
 */
export const obtenerHistorialUsuario = async (userId) => {
    return await MatchDao.searchAllMatchesFromUser(userId);
};


/**
 * Notifica a todos los jugadores de la sala su visión actualizada.
 * Útil tras movimientos, rotaciones o eventos de combate que cambien la visión.
 */
export const notificarVisionSala = async (io, matchId) => {
    const socketsEnSala = await io.in(matchId).fetchSockets();
    for (const s of socketsEnSala) {
        const targetUserId = s.data.user.id;
        const vision = await generarSnapshotVision(matchId, targetUserId);
        s.emit('match:vision_update', vision);
    }
};

/**
 * Obtiene las dimensiones reales del barco, adaptadose a su orientación
 * @param {Object} barco Objeto del barco
 * @returns {Promise<{ effectiveWidth: number, effectiveHeight: number }>} Dimensiones reales del barco
 */
export const obtenerTamanoEfectiva = async (barco) => {
    console.log(barco);
    const tamano = await EngineDao.getShipSize(barco.id);
    console.log(tamano);
    console.log (barco.orientation);
    if (barco.orientation === 'N' || barco.orientation === 'S') {
            return { 
                effectiveWidth: tamano.width, 
                effectiveHeight: tamano.height 
            };
        } 
    return { 
        effectiveWidth: tamano.height, 
        effectiveHeight: tamano.width 
    };
}
