/**
 * Manejador interno de eventos de turno y rendición.
 */
import MatchDao from '../dao/MatchDao.js';
import { engineService } from '../../engine/index.js';
import { combatService } from '../../engine/index.js';
import ProjectileDao from '../../engine/dao/ProjectileDao.js';
import EngineDao from '../../engine/dao/EngineDao.js';
import { matchService, statusService } from '../index.js';

export const registerTurnHandlers = (io, socket) => {

    /**
     * Finaliza el turno del jugador actual.
     */
    socket.on('match:turn_end', async (data) => {
        const { matchId } = data;
        const userId = socket.data.user.id;

        try {
            const partida = await MatchDao.findById(matchId);

            if (!partida || partida.currentTurnPlayerId !== userId) {
                throw new Error('No es tu turno');
            }

            const oponente = partida.MatchPlayers.find(p => p.userId !== userId);
            if (!oponente) {
                throw new Error('Oponente no encontrado');
            }

            const nuevosRecursos = matchService.calcularRegeneracionTurno({
                fuel: oponente.fuelReserve,
                ammo: oponente.ammoCurrent
            });

            // Resolucion de proyectiles
            const proyectiles = await ProjectileDao.findAllProjectiles(matchId);
            const barcosVivos = await EngineDao.findAllAliveShipsWithSizes(matchId);

            for (const proy of proyectiles) {
                if (proy.vectorX !== 0 || proy.vectorY !== 0) {
                    
                    proy.x += proy.vectorX;
                    proy.y += proy.vectorY;
                    proy.lifeDistance -= 1;

                    if (!engineService.validarLimitesMapa([{ x: proy.x, y: proy.y }]) || proy.lifeDistance < 0) {
                        await ProjectileDao.removeProjectile(proy.id);
                        continue;
                    }

                    await ProjectileDao.updateProjectile(proy.id, {
                        x: proy.x,
                        y: proy.y,
                        lifeDistance: proy.lifeDistance
                    });

                    for (const barco of barcosVivos) {
                        const tamanoReal = engineService.calculartamanoEfectivo(
                            barco.UserShip.ShipTemplate.width, 
                            barco.UserShip.ShipTemplate.height, 
                            barco.orientation
                        );
                        const celdasBarco = engineService.calcularCeldasOcupadas(
                            barco.x, barco.y, 
                            tamanoReal.effectiveWidth, tamanoReal.effectiveHeight
                        );

                        const colision = celdasBarco.find(c => c.x === proy.x && c.y === proy.y);

                        if (colision) {
                            const damage = proy.damage; 
                            const newHp = Math.max(0, barco.currentHp - damage);
                            const isSunk = newHp === 0;

                            await EngineDao.registerHit(barco.id, newHp, barco.hitCells || [], isSunk);
                            await ProjectileDao.removeProjectile(proy.id);

                            io.to(matchId).emit('projectile:hit', {
                                shipId: barco.id,
                                proyectilColisionado: proy.id,
                                newHp
                            });

                            await matchService.notificarVisionSala(io, matchId);
                            break; 
                        }
                    }
                }
            }
            
            const nextTurnNumber = partida.turnNumber + 1;
            const nextPlayerId = oponente.userId;

            await MatchDao.updateResources(oponente.id, nuevosRecursos.fuel, nuevosRecursos.ammo);
            await MatchDao.updateTurn(partida.id, nextPlayerId, nextTurnNumber);

            io.to(matchId).emit('match:turn_changed', {
                nextPlayerId: nextPlayerId,
                turnNumber: nextTurnNumber,
                resources: nuevosRecursos
            });
        } catch (error) {
            socket.emit('game:error', { message: error.message });
        }
    });

    /**
     * Gestiona la rendición voluntaria.
     */
    socket.on('match:surrender', async (data) => {
        const { matchId } = data;
        const userId = socket.data.user.id;

        try {
            const partida = await MatchDao.findById(matchId);
            if (!partida || partida.status === 'FINISHED') return;

            const ganador = partida.MatchPlayers.find(p => p.userId !== userId);
            
            if (ganador) {
                await statusService.registrarVictoria(matchId, ganador.userId);
            }

            io.to(matchId).emit('match:finished', {
                winnerId: ganador ? ganador.userId : null,
                reason: 'surrender'
            });
        } catch (error) {
            socket.emit('game:error', { message: error.message });
        }
    });
};