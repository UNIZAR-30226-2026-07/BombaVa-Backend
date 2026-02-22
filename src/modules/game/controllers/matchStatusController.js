import { Match } from '../../../shared/models/index.js';
import * as statusService from '../services/matchStatusService.js';

/**
 * Endpoint para rendición voluntaria
 * @param {object} req 
 * @param {object} res 
 * @param {function} next 
 */
export const surrenderMatch = async (req, res, next) => {
    try {
        const { matchId } = req.params;
        const partida = await Match.findByPk(matchId);

        if (!partida || partida.status === 'FINISHED') {
            return res.status(400).json({ message: 'Operación no válida' });
        }

        await statusService.finalizarPartida(matchId);
        res.json({ message: 'Rendición procesada', status: 'FINISHED' });
    } catch (error) {
        next(error);
    }
};

/**
 * Utilidad de API para verificar victoria tras un daño (Usada por otros controladores)
 * @param {string} matchId 
 * @param {string} playerId 
 * @returns {Promise<boolean>}
 */
export const checkWinCondition = async (matchId, playerId) => {
    const haPerdido = await statusService.verificarDerrotaJugador(matchId, playerId);
    if (haPerdido) {
        await statusService.finalizarPartida(matchId);
        return true;
    }
    return false;
};