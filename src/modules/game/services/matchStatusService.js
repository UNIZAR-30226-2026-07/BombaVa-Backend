import { Match, ShipInstance } from '../../../shared/models/index.js';

/**
 * Lógica pura de estados finales y condiciones de victoria
 */

/**
 * Comprueba si al jugador le quedan unidades a flote
 * @param {string} matchId 
 * @param {string} playerId 
 * @returns {Promise<boolean>} True si el jugador ha perdido
 */
export const verificarDerrotaJugador = async (matchId, playerId) => {
    const unidadesVivas = await ShipInstance.count({
        where: { matchId, playerId, isSunk: false }
    });
    return unidadesVivas === 0;
};

/**
 * Cambia el estado de la partida a finalizado
 * @param {string} matchId 
 */
export const finalizarPartida = async (matchId) => {
    await Match.update({ status: 'FINISHED' }, { where: { id: matchId } });
};