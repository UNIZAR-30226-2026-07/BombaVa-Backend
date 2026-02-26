/**
 * Manejador interno de eventos de turno y rendición.
 */
import { Match, MatchPlayer, sequelize } from '../../../shared/models/index.js';
import { matchService, statusService } from '../index.js';

export const registerTurnHandlers = (io, socket) => {

    /**
     * Finaliza el turno del jugador actual.
     */
    socket.on('match:turn_end', async (data) => {
        const { matchId } = data;
        const userId = socket.data.user.id;
        const transaction = await sequelize.transaction();

        try {
            const partida = await Match.findByPk(matchId, {
                include: [MatchPlayer],
                transaction
            });

            if (!partida || partida.currentTurnPlayerId !== userId) {
                throw new Error('No es tu turno');
            }

            const oponente = partida.MatchPlayers.find(p => p.userId !== userId);
            const nuevosRecursos = matchService.calcularRegeneracionTurno({
                fuel: oponente.fuelReserve,
                ammo: oponente.ammoCurrent
            });

            oponente.fuelReserve = nuevosRecursos.fuel;
            oponente.ammoCurrent = nuevosRecursos.ammo;
            partida.currentTurnPlayerId = oponente.userId;
            partida.turnNumber += 1;

            await Promise.all([
                partida.save({ transaction }),
                oponente.save({ transaction })
            ]);

            await transaction.commit();

            io.to(matchId).emit('match:turn_changed', {
                nextPlayerId: partida.currentTurnPlayerId,
                turnNumber: partida.turnNumber,
                resources: nuevosRecursos
            });
        } catch (error) {
            if (transaction) await transaction.rollback();
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
            const partida = await Match.findByPk(matchId, { include: [MatchPlayer] });
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