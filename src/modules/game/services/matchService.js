/**
 * Servicio de Gestión de Partidas
 * Orquesta la creación, recuperación de estados y lógica de recursos.
 */
import { GAME_RULES } from '../../../config/gameRules.js';
import { InventoryDao } from '../../inventory/dao/index.js';
import { MatchDao } from '../dao/index.js';
import { EngineDao } from '../../engine/dao/index.js';
import {ProjectileDao} from '../../engine/dao/index.js';
import {engineService} from '../../engine/services/index.js';
import { combatService } from '../../engine/services/index.js';
/**
 * Traduce coordenadas relativas del puerto a absolutas del mapa de batalla
 * @param {Object} pos 
 * @param {string} bando 
 */
export const traducirPosicionTablero = (pos, bando) => {
    return bando === 'NORTH' ? pos : { x: (GAME_RULES.MAP.SIZE - 1) - pos.x, y: (GAME_RULES.MAP.SIZE - 1) - pos.y };
};

/**
 * Traduce el vector de movimiento de un proyectil dependiendo de la perspectiva del jugador.
 * @param {Object} vector - El vector original
 * @param {string} bando - El bando del jugador
 * @returns {{ vx: number, vy: number }} El vector traducido
 */
export const traducirVectorProyectil = (vector, bando) => {
    if (bando === 'NORTH') return { vector };
    else return { vx: -vector.vx, vy: -vector.vy };
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
 * V2: Devuelve los barcos enemigos que esten en el rango de visión.
 */
export const generarSnapshotVision = async (matchId, userId) => {
    const jugador = await MatchDao.findMatchPlayer(matchId, userId);
    const bando = jugador.side;
    // Obtenemos todos los barcos del tablero
    const todosLosBarcos = await EngineDao.findByMatchId(matchId);
    const misBarcosRaw = todosLosBarcos.filter(b => b.playerId === userId);
    const enemigosRaw = todosLosBarcos.filter(b => b.playerId !== userId);

    //Ahora con vissión de niebla
    const enemigosVisiblesRaw = await calcularVision(misBarcosRaw, enemigosRaw);

    const limpiarYTraducir = async (barcos) => {
        const promesas = barcos.map(async (barco) => {
            const posTraducida = traducirPosicionTablero({ x: barco.x, y: barco.y }, bando);
            const orientacionTraducida = traducirOrientacion(barco.orientation, bando);
            const hitCellsTraducidas = barco.hitCells
                ? barco.hitCells.map(hit => traducirPosicionTablero(hit, bando))
                : [];

            const tamano = await obtenerTamanoEfectiva(barco);
            
            const armasSnapshot = barco.CombatWeapons ? barco.CombatWeapons.map(w => ({
                type: w.type,
                name: w.name,
                apCost: w.apCost,
                range: w.range,
                damage: w.damage
            })) : [];
            return {
                id: barco.id,
                x: posTraducida.x,
                y: posTraducida.y,
                orientation: orientacionTraducida,
                currentHp: barco.currentHp,
                hitCells: hitCellsTraducidas,
                isSunk: barco.isSunk,
                visionRange: barco.UserShip.ShipTemplate.visionRange,
                efectiveWidth: tamano.effectiveWidth,
                effectiveHeight: tamano.effectiveHeight,
                weapons: armasSnapshot
            };
        });
        return Promise.all(promesas);
    };

    const proyectilesTodos = await ProjectileDao.findAllProjectiles(matchId);
    const todosLosVisibles = await filtrarProyectilesVisibles(misBarcosRaw, proyectilesTodos, userId);
    const proyPropios = [];
    const proyEnemigos = [];
    for (const proy of todosLosVisibles) {
        const posTraducida = traducirPosicionTablero({ x: proy.x, y: proy.y }, bando);
        const vecTraducida = traducirVectorProyectil({vx: proy.vectorX, vy: proy.vectorY}, bando);
        if (proy.ownerId === userId) {
            proyPropios.push({
                id: proy.id,
                lifeDistance: proy.lifeDistance,
                matchId: proy.matchId,
                ownerId: proy.ownerId,
                type: proy.type,
                vectorX: vecTraducida.vx,
                vectorY: vecTraducida.vy,
                x: posTraducida.x,
                y: posTraducida.y
            });
        } else {
            proyEnemigos.push({
                id: proy.id,
                lifeDistance: proy.lifeDistance,
                matchId: proy.matchId,
                ownerId: proy.ownerId,
                type: proy.type,
                vectorX: vecTraducida.vx,
                vectorY: vecTraducida.vy,
                x: posTraducida.x,
                y: posTraducida.y
            });
        }
    }
    return {
        myFleet: await limpiarYTraducir(misBarcosRaw),
        visibleEnemyFleet: await limpiarYTraducir(enemigosVisiblesRaw),
        proyPropios: proyPropios,
        proyEnemigos: proyEnemigos
    };
};


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
    const proyectiles = await ProjectileDao.findAllProjectiles(matchId);
    const proyPropios = proyectiles.filter(b => b.playerId === userId);
    const proyEnemigos = proyectiles.filter(b => b.playerId !== userId);

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
        enemyFleet: vision.visibleEnemyFleet,
        proyPropios: proyPropios,
        proyEnemigos: proyEnemigos
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
    const tamano = await EngineDao.getShipSize(barco.id);
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

/**
 * Calcula qué barcos enemigos son visibles para el jugador actual.
 * @param {Array} misBarcosRaw - Lista de barcos del jugador que solicita la visión.
 * @param {Array} enemigosRaw - Lista de barcos del oponente.
 * @returns {Array} - Conjunto elementos que son visibles.
 */
export const calcularVision = async (misBarcosRaw, enemigosRaw) => {
    const enemigosDetectados = new Set();

    for (const miBarco of misBarcosRaw) {
        const rangoVision = miBarco.UserShip?.ShipTemplate?.visionRange || 0;
        // Si el barco está hundido o no tiene rango, no aporta visión
        if (miBarco.isSunk || rangoVision <= 0) continue;

        const tamano = await obtenerTamanoEfectiva(miBarco);
        const celdasMias = engineService.calcularCeldasOcupadas(
            miBarco.x,
            miBarco.y,
            tamano.effectiveWidth,
            tamano.effectiveHeight
        );
        for (const enemigo of enemigosRaw) {
            // Si ya lo ha visto otro barco, saltamos 
            if (enemigosDetectados.has(enemigo)) continue;
            const tamano = await obtenerTamanoEfectiva(enemigo);
            const celdasEnemigo = engineService.calcularCeldasOcupadas(
                enemigo.x,
                enemigo.y,
                tamano.effectiveWidth,
                tamano.effectiveHeight
            );
            // Comprobar si alguna celda del enemigo está en el rango de visión
            const esVisible = celdasEnemigo.some(celdaE => 
                combatService.validarRangoAtaque(celdasMias, celdaE, rangoVision)
            );

            if (esVisible) {
                enemigosDetectados.add(enemigo);
            }
        }
    }
    return Array.from(enemigosDetectados);
};


/**
 * Filtra proyectiles basándose en la visión de los barcos y reglas especiales para minas.
 * @param {Array} misBarcos - Flota del jugador actual.
 * @param {Array} proyectilesRaw - Todos los proyectiles de la partida.
 * @param {string} userId - ID del jugador que recibe la información.
 */
export const filtrarProyectilesVisibles = async (misBarcos, proyectilesRaw, userId) => {
    const proyVisibles = [];

    for (const proy of proyectilesRaw) {
        // El proyectil propio es siempre visible
        if (proy.ownerId === userId) {
            proyVisibles.push(proy);
            continue;
        }
        let detectado = false;

        for (const miBarco of misBarcos) {
            if (miBarco.isSunk) continue;

            const tamano = await obtenerTamanoEfectiva(miBarco);
            const celdasMias = engineService.calcularCeldasOcupadas(
                miBarco.x, miBarco.y, 
                tamano.effectiveWidth, tamano.effectiveHeight
            );

            const posProy = { x: proy.x, y: proy.y };

            if (proy.type === 'MINE') {
                if (combatService.validarAdyacencia(celdasMias, posProy)) {
                    detectado = true;
                    break;
                }
            } else {
                const rangoVision = miBarco.UserShip?.ShipTemplate?.visionRange || 0;
                if (combatService.validarRangoAtaque(celdasMias, posProy, rangoVision)) {
                    detectado = true;
                    break;
                }
            }
        }
        if (detectado) proyVisibles.push(proy);
    }

    return proyVisibles;
};