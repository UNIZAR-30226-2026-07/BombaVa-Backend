import { BOT_UUID } from '../../../shared/models/bootstrap.js';
import MatchDao from '../../game/dao/MatchDao.js';
import EngineDao from '../dao/EngineDao.js';
import { matchService } from '../../game/services/index.js';
import { handleShipMove } from '../sockets/movement.js';
import { handleCannonAttack } from '../sockets/combat/cannon.js';
import { handleMineDrop } from '../sockets/combat/mine.js';
import { handleTorpedoLaunch } from '../sockets/combat/torpedo.js';
import { handleTurnEnd } from '../../game/sockets/turn.js';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const createFakeSocket = () => ({
    data: { user: { id: BOT_UUID, username: 'Comandante_IA' } },
    emit: (event, payload) => {
        if (event === 'game:error') console.log('[IA Log]', payload.message);
    },
    to: () => ({ emit: () => { } })
});

const calcularDistancia = (p1, p2) => Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));

export const playTurn = async (matchId, io) => {
    console.log(`\n[IA] Despertando en partida: ${matchId.slice(0,8)}`);
    const fakeSocket = createFakeSocket();
    let turnActive = true;
    let fallbackSafety = 0; // Para evitar bucles infinitos

    await sleep(1000);

    while (turnActive && fallbackSafety < 10) {
        fallbackSafety++;
        try {
            const partida = await MatchDao.findById(matchId);
            if (!partida || partida.status !== 'PLAYING' || partida.currentTurnPlayerId !== BOT_UUID) break;

            const jugadorBot = await MatchDao.findMatchPlayer(matchId, BOT_UUID);
            const barcosVivos = await EngineDao.findAllAliveShipsWithSizes(matchId);
            const misBarcos = barcosVivos.filter(b => b.playerId === BOT_UUID && !b.isSunk);
            const enemigos = barcosVivos.filter(b => b.playerId !== BOT_UUID && !b.isSunk);

            if (misBarcos.length === 0 || enemigos.length === 0) break;

            let accionRealizada = false;

            // INTENTAR ATACAR
            for (const miBarco of misBarcos) {
                if (miBarco.lastAttackTurn === partida.turnNumber) continue;

                const enemigo = enemigos[0]; 
                const dist = calcularDistancia(miBarco, enemigo);
                const targetRel = matchService.traducirPosicionTablero({ x: enemigo.x, y: enemigo.y }, jugadorBot.side);

                if (dist <= 4 && jugadorBot.ammoCurrent >= 2) {
                    console.log(`[IA] Atacando a enemigo a distancia ${dist.toFixed(1)}`);
                    await handleCannonAttack(io, fakeSocket, { matchId, shipId: miBarco.id, target: targetRel });
                    accionRealizada = true;
                    break;
                }
            }

            if (accionRealizada) { await sleep(1000); continue; }

            // INTENTAR MOVERSE
            if (jugadorBot.fuelReserve >= 1) {
                const miBarco = misBarcos[0];
                const combustibleAntes = jugadorBot.fuelReserve;
                
                console.log(`[IA] Intentando avanzar...`);
                await handleShipMove(io, fakeSocket, { matchId, shipId: miBarco.id, direction: 'N' });
                
                // Verificamos si realmente se ha movido (mirando si ha bajado el fuel)
                const jugadorPost = await MatchDao.findMatchPlayer(matchId, BOT_UUID);
                if (jugadorPost.fuelReserve < combustibleAntes) {
                    accionRealizada = true;
                }
            }

            // SI NO HA PODIDO HACER NADA, SALIR DEL BUCLE
            if (!accionRealizada) {
                console.log(`[IA] No hay acciones posibles (sin fuel o bloqueado).`);
                turnActive = false;
            } else {
                await sleep(1000);
            }

        } catch (error) {
            if (error.message.includes('ConnectionManager')) break;
            console.error("[IA Error]", error);
            break;
        }
    }

    console.log(`[IA] Cediendo turno.`);
    await handleTurnEnd(io, fakeSocket, { matchId }).catch(() => {});
};