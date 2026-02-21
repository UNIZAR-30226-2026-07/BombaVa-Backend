import { Match, ShipInstance } from '../../../shared/models/index.js';

/**
 * Procesa la rendición voluntaria de un jugador y finaliza la partida
 * @param {object} req - Petición con matchId
 * @param {object} res - Confirmación de rendición
 * @param {function} next - Middleware de error
 */
export const surrenderMatch = async (req, res, next) => {
    try {
        const { matchId } = req.params;
        const partida = await Match.findByPk(matchId);

        if (!partida || partida.status === 'FINISHED') {
            return res.status(400).json({ message: 'La partida no es válida o ya ha finalizado' });
        }

        partida.status = 'FINISHED';
        await partida.save();

        res.json({ message: 'Te has rendido. Partida finalizada.', status: partida.status });
    } catch (error) {
        next(error);
    }
};

/**
 * Verifica si un jugador ha perdido todos sus barcos y actualiza el estado de la partida
 * @param {string} matchId - ID de la partida
 * @param {string} playerId - ID del jugador que recibió daño
 */
export const checkWinCondition = async (matchId, playerId) => {
    const barcosActivos = await ShipInstance.count({
        where: { matchId, playerId, isSunk: false }
    });

    if (barcosActivos === 0) {
        await Match.update({ status: 'FINISHED' }, { where: { id: matchId } });
        return true;
    }
    return false;
};