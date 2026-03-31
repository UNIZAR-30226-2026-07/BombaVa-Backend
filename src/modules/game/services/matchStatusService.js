/**
 * Servicio de Estado de Partida
 * Gestiona el ciclo de vida final: victorias, derrotas y cierre de sesiones de forma atómica.
 */
import { Match } from '../../../shared/models/index.js';
import * as userService from '../../auth/services/userService.js';
import { EngineDao } from '../../engine/dao/index.js';
import { MatchDao } from '../dao/index.js';

/**
 * Comprueba si al jugador le quedan unidades a flote.
 * @param {string} matchId - Identificador de la partida.
 * @param {string} playerId - Identificador del jugador.
 * @returns {Promise<boolean>} Verdadero si no quedan barcos vivos.
 */
export const verificarDerrotaJugador = async (matchId, playerId) => {
    const unidadesVivas = await EngineDao.countAliveShips(matchId, playerId);
    return unidadesVivas === 0;
};

/**
 * Finaliza la partida de forma atómica para evitar condiciones de carrera.
 * @param {string} matchId - Identificador de la partida.
 * @returns {Promise<boolean>} Verdadero si la partida se finalizó con éxito en esta llamada.
 */
export const finalizarPartida = async (matchId) => {
    const [updatedRows] = await Match.update(
        { status: 'FINISHED' },
        { where: { id: matchId, status: 'PLAYING' } }
    );
    return updatedRows > 0;
};

/**
 * Procesa la victoria de un jugador específico asegurando unicidad en el cálculo de ELO.
 * @param {string} matchId - Identificador de la partida.
 * @param {string} winnerId - Identificador del usuario ganador.
 * @returns {Promise<void>}
 */
export const registrarVictoria = async (matchId, winnerId) => {
    const fueFinalizada = await finalizarPartida(matchId);
    if (!fueFinalizada) return;

    const jugadores = await MatchDao.findPlayersByMatch(matchId);
    const oponente = jugadores.find(p => p.userId !== winnerId);

    if (oponente) {
        await userService.procesarResultadoElo(winnerId, oponente.userId);
    }
};