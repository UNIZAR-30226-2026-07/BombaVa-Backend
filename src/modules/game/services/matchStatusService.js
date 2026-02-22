/**
 * Servicio de Estado de Partida
 * Gestiona el ciclo de vida final: victorias, derrotas y cierre de sesiones.
 */
import { Match, MatchPlayer, ShipInstance } from '../../../shared/models/index.js';
import * as userService from '../../auth/services/userService.js';

/**
 * Comprueba si al jugador le quedan unidades a flote
 * @param {string} matchId - ID de la partida
 * @param {string} playerId - ID del jugador a comprobar
 * @returns {Promise<boolean>} True si no le quedan barcos
 */
export const verificarDerrotaJugador = async (matchId, playerId) => {
    const unidadesVivas = await ShipInstance.count({
        where: { matchId, playerId, isSunk: false }
    });
    return unidadesVivas === 0;
};

/**
 * Finaliza la partida y actualiza el estado en la base de datos
 * @param {string} matchId - ID de la partida
 */
export const finalizarPartida = async (matchId) => {
    const partida = await Match.findByPk(matchId, { include: [MatchPlayer] });
    if (!partida || partida.status === 'FINISHED') return;

    await partida.update({ status: 'FINISHED' });
};

/**
 * Procesa la victoria de un jugador específico y dispara el cálculo de ELO
 * @param {string} matchId - ID de la partida
 * @param {string} winnerId - ID del usuario ganador
 */
export const registrarVictoria = async (matchId, winnerId) => {
    const partida = await Match.findByPk(matchId, { include: [MatchPlayer] });
    if (!partida) return;

    const oponente = partida.MatchPlayers.find(p => p.userId !== winnerId);

    if (oponente) {
        await userService.procesarResultadoElo(winnerId, oponente.userId);
    }

    await finalizarPartida(matchId);
};