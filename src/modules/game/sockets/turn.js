/**
 * Manejador interno de eventos de turno y rendición.
 */
import MatchDao from '../dao/MatchDao.js';
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

            // Resolucion de proyectiles aqui
            
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