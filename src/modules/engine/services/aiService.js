import { BOT_UUID } from '../../../shared/models/bootstrap.js';
import MatchDao from '../../game/dao/MatchDao.js';
import EngineDao from '../dao/EngineDao.js';
import { matchService } from '../../game/services/index.js';
import { handleShipMove, handleShipRotate } from '../sockets/movement.js';
import { handleCannonAttack } from '../sockets/combat/cannon.js';
import { handleTorpedoLaunch } from '../sockets/combat/torpedo.js';
import { handleTurnEnd } from '../../game/sockets/turn.js';
import { GAME_RULES } from '../../../config/gameRules.js';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const createFakeSocket = () => ({
    data: { user: { id: BOT_UUID, username: 'Comandante_IA' } },
    emit: (event, payload) => {
        if (event === 'game:error' && !payload.message.includes('Colisión') && !payload.message.includes('fuera de límites')) {
            console.log('[IA Error Interno]', payload.message);
        }
    },
    to: () => ({ emit: () => { } })
});

const calcularDistancia = (p1, p2) => Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
const isAligned = (p1, p2) => p1.x === p2.x || p1.y === p2.y;

const getDegreesToFace = (current, target) => {
    const right = { 'N': 'E', 'E': 'S', 'S': 'W', 'W': 'N' };
    const left = { 'N': 'W', 'W': 'S', 'S': 'E', 'E': 'N' };
    if (right[current] === target) return 90;
    if (left[current] === target) return -90;
    return 90; 
};

const seleccionarMejorObjetivo = (miBarco, enemigos) => {
    let mejorObjetivo = null;
    let mejorPuntuacion = -Infinity;

    for (const enemigo of enemigos) {
        const dist = calcularDistancia(miBarco, enemigo);
        let puntuacion = 100 - (dist * 5); 
        if (enemigo.currentHp <= 20) puntuacion += 50; 
        if (puntuacion > mejorPuntuacion) {
            mejorPuntuacion = puntuacion;
            mejorObjetivo = enemigo;
        }
    }
    return mejorObjetivo;
};

export const playTurn = async (matchId, io) => {
    console.log(`\n[IA] Iniciando turno en partida: ${matchId.slice(0,8)}`);
    const fakeSocket = createFakeSocket();
    
    try {
        let partida = await MatchDao.findById(matchId);
        if (!partida || partida.status !== 'PLAYING' || partida.currentTurnPlayerId !== BOT_UUID) return;

        let barcosVivosIniciales = await EngineDao.findAllAliveShipsWithSizes(matchId);
        let misBarcos = barcosVivosIniciales.filter(b => b.playerId === BOT_UUID);

        if (misBarcos.length === 0) return;

        // BUCLE POR CADA BARCO DE LA IA
        for (let miBarco of misBarcos) {
            let barcosVivos = await EngineDao.findAllAliveShipsWithSizes(matchId);
            
            miBarco = barcosVivos.find(b => b.id === miBarco.id);
            if (!miBarco) continue; 

            let enemigos = barcosVivos.filter(b => b.playerId !== BOT_UUID);
            if (enemigos.length === 0) break;

            let jugadorBot = await MatchDao.findMatchPlayer(matchId, BOT_UUID);
            const barcoCompleto = await EngineDao.findById(miBarco.id);
            
            const objetivo = seleccionarMejorObjetivo(miBarco, enemigos);
            if (!objetivo) continue;

            let dist = calcularDistancia(miBarco, objetivo);

            // INTENTAR MOVER
            let intentosBloqueo = 0;
            let lastActionWasRotate = false; // Flag para evitar bucles infinitos de giro

            while (dist > 3 && jugadorBot.fuelReserve > 0 && intentosBloqueo < 3) {
                let fuelAntes = jugadorBot.fuelReserve;
                let diffX = objetivo.x - miBarco.x;
                let diffY = objetivo.y - miBarco.y;
                
                let absDir = '';
                if (Math.abs(diffX) > Math.abs(diffY)) {
                    absDir = diffX > 0 ? 'E' : 'W';
                } else {
                    absDir = diffY > 0 ? 'N' : 'S';
                }

                if (intentosBloqueo > 0) {
                    if (absDir === 'E' || absDir === 'W') {
                        absDir = diffY > 0 ? 'N' : (diffY < 0 ? 'S' : absDir);
                    } else {
                        absDir = diffX > 0 ? 'E' : (diffX < 0 ? 'W' : absDir);
                    }
                }

                if (miBarco.orientation !== absDir) {
                    // Si la última acción exitosa fue girar, q no gire otra vez, rompe
                    if (lastActionWasRotate) {
                        console.log(`[IA] Bloqueo detectado. Abortando movimiento para barco ${miBarco.id.slice(0,4)}`);
                        break; 
                    }

                    if (jugadorBot.fuelReserve < GAME_RULES.RESOURCES.COST_ROTATE) break; 
                    
                    let degrees = getDegreesToFace(miBarco.orientation, absDir);
                    await handleShipRotate(io, fakeSocket, { matchId, shipId: miBarco.id, degrees });
                    await sleep(400);
                    
                    const barcoActualizado = await EngineDao.findById(miBarco.id);
                    if (!barcoActualizado || barcoActualizado.isSunk) break; 
                    
                    miBarco.orientation = barcoActualizado.orientation;
                    jugadorBot = await MatchDao.findMatchPlayer(matchId, BOT_UUID);
                    
                    if (jugadorBot.fuelReserve === fuelAntes) {
                        intentosBloqueo++; 
                    } else {
                        intentosBloqueo = 0; 
                        lastActionWasRotate = true; // Registramos que acabamos de girar con éxito
                    }
                } 
                else {
                    if (jugadorBot.fuelReserve < GAME_RULES.RESOURCES.COST_MOVE) break; 
                    
                    const relDir = matchService.traducirOrientacion(absDir, jugadorBot.side);
                    await handleShipMove(io, fakeSocket, { matchId, shipId: miBarco.id, direction: relDir });
                    await sleep(400);

                    const barcoActualizado = await EngineDao.findById(miBarco.id);
                    if (!barcoActualizado || barcoActualizado.isSunk) break;

                    miBarco.x = barcoActualizado.x;
                    miBarco.y = barcoActualizado.y;
                    
                    dist = calcularDistancia(miBarco, objetivo);
                    jugadorBot = await MatchDao.findMatchPlayer(matchId, BOT_UUID);
                    
                    if (jugadorBot.fuelReserve === fuelAntes) {
                        intentosBloqueo++; 
                    } else {
                        intentosBloqueo = 0; 
                        lastActionWasRotate = false; // Nos movimos con éxito, reseteamos el flag de giro
                    }
                }
            }

            if (miBarco.isSunk) continue;

            // DISPARA
            partida = await MatchDao.findById(matchId);
            
            if (barcoCompleto.lastAttackTurn !== partida.turnNumber) {
                const targetRel = matchService.traducirPosicionTablero({ x: objetivo.x, y: objetivo.y }, jugadorBot.side);
                const hasTorpedo = barcoCompleto.CombatWeapons?.some(w => w.type === 'TORPEDO');
                const hasCannon = barcoCompleto.CombatWeapons?.some(w => w.type === 'CANNON');

                // Prioridad 1 Torpedos
                if (hasTorpedo && isAligned(miBarco, objetivo) && dist <= GAME_RULES.COMBAT.TORPEDO_LIFE && jugadorBot.ammoCurrent >= GAME_RULES.RESOURCES.COST_TORPEDO) {
                    const desiredDir = miBarco.x === objetivo.x 
                        ? (objetivo.y > miBarco.y ? 'N' : 'S')
                        : (objetivo.x > miBarco.x ? 'E' : 'W');
                    
                    if (miBarco.orientation === desiredDir) {
                        console.log(`[IA] Lanzando torpedo hacia objetivo ${objetivo.id.slice(0,4)}`);
                        await handleTorpedoLaunch(io, fakeSocket, { matchId, shipId: miBarco.id });
                        await sleep(600);
                        continue;
                    } 
                    else if (jugadorBot.fuelReserve >= GAME_RULES.RESOURCES.COST_ROTATE) {
                        let degrees = getDegreesToFace(miBarco.orientation, desiredDir);
                        await handleShipRotate(io, fakeSocket, { matchId, shipId: miBarco.id, degrees });
                        await sleep(500);
                        
                        const actual = await EngineDao.findById(miBarco.id);
                        if (actual && !actual.isSunk && actual.orientation === desiredDir) {
                            console.log(`[IA] Alineación completada. Lanzando torpedo!`);
                            await handleTorpedoLaunch(io, fakeSocket, { matchId, shipId: miBarco.id });
                            await sleep(600);
                            continue;
                        }
                    }
                }

                // Priodridad 2 Cañón Estándar
                if (hasCannon && dist <= GAME_RULES.COMBAT.CANNON_RANGE && jugadorBot.ammoCurrent >= GAME_RULES.RESOURCES.COST_CANNON) {
                    console.log(`[IA] Disparando cañón desde ${miBarco.id.slice(0,4)} a objetivo ${objetivo.id.slice(0,4)}`);
                    await handleCannonAttack(io, fakeSocket, { matchId, shipId: miBarco.id, target: targetRel });
                    await sleep(600);
                }
            }
        }

        console.log(`[IA] Fin de acciones. Cediendo turno.`);
        await sleep(1000); 
        await handleTurnEnd(io, fakeSocket, { matchId });

    } catch (error) {
        console.error("[IA Error Crítico]", error);
        await handleTurnEnd(io, fakeSocket, { matchId }).catch(() => {});
    }
};
