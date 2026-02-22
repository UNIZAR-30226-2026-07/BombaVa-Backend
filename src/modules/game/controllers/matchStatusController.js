/**
 * Controlador de Estado de Partida
 * Gestiona la finalización de sesiones y condiciones de victoria.
 */
import { Match, MatchPlayer } from '../../../shared/models/index.js';
import * as statusService from '../services/matchStatusService.js';

/**
 * Endpoint para rendición voluntaria
 * Actualiza el ELO del oponente como ganador.
 */
export const surrenderMatch = async (req, res, next) => {
    try {
        const { matchId } = req.params;
        const partida = await Match.findByPk(matchId, { include: [MatchPlayer] });

        if (!partida || partida.status === 'FINISHED') {
            return res.status(400).json({ message: 'Operación no válida' });
        }

        const ganador = partida.MatchPlayers.find(p => p.userId !== req.user.id);

        if (ganador) {
            await statusService.registrarVictoria(matchId, ganador.userId);
        } else {
            await statusService.finalizarPartida(matchId);
        }

        res.json({ message: 'Rendición procesada', status: 'FINISHED' });
    } catch (error) {
        next(error);
    }
};

/**
 * Utilidad para verificar victoria tras un impacto
 */
export const checkWinCondition = async (matchId, playerId) => {
    const haPerdido = await statusService.verificarDerrotaJugador(matchId, playerId);
    if (haPerdido) {
        await statusService.finalizarPartida(matchId);
        return true;
    }
    return false;
};