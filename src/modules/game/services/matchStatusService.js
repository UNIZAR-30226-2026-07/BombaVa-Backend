/**
 * Servicio de Estado de Partida
 * Gestiona el ciclo de vida final: victorias, derrotas y cierre de sesiones.
 */
import { Match, MatchPlayer } from '../../../shared/models/index.js';
import * as userService from '../../auth/services/userService.js';

/**
 * Comprueba si al jugador le quedan unidades a flote
 */
export const verificarDerrotaJugador = async (matchId, playerId) => {
    const unidadesVivas = await ShipInstance.count({
        where: { matchId, playerId, isSunk: false }
    });
    return unidadesVivas === 0;
};

/**
 * Finaliza la partida y actualiza los rankings de los jugadores
 */
export const finalizarPartida = async (matchId) => {
    const partida = await Match.findByPk(matchId, { include: [MatchPlayer] });
    if (!partida || partida.status === 'FINISHED') return;

    await partida.update({ status: 'FINISHED' });

    // TODO: la lógica de ELO es Identificar ganador y perdedor
    // (Esta lógica se disparará cuando un jugador se rinda o pierda sus barcos)
    const jugadores = partida.MatchPlayers;
    if (jugadores.length === 2) {
        // TODO: Por simplicidad en V1, se llama tras una victoria
        // pero en un futuro podríamos hacer que buscara quién tiene barcos vivos
        // para evitar cheats
    }
};

/**
 * Procesa la victoria de un jugador específico
 */
export const registrarVictoria = async (matchId, winnerId) => {
    const partida = await Match.findByPk(matchId, { include: [MatchPlayer] });
    const oponente = partida.MatchPlayers.find(p => p.userId !== winnerId);

    if (oponente) {
        await userService.procesarResultadoElo(winnerId, oponente.userId);
    }

    await finalizarPartida(matchId);
};