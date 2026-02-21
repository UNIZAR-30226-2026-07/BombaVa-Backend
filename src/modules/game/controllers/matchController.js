import { Match, MatchPlayer } from '../../../shared/models/index.js';

/**
 * Recupera el estado de una partida específica
 * @param {object} req - Petición Express
 * @param {object} res - Respuesta Express
 * @param {function} next - Siguiente middleware
 */
export const getMatchStatus = async (req, res, next) => {
    try {
        const { matchId } = req.params;
        const partida = await Match.findByPk(matchId, {
            include: [{ model: MatchPlayer }]
        });

        if (!partida) return res.status(404).json({ message: 'Partida no encontrada' });

        res.json(partida);
    } catch (error) {
        next(error);
    }
};

/**
 * Registra una solicitud de pausa que debe ser aceptada por el oponente
 * @param {object} req - Petición Express
 * @param {object} res - Respuesta Express
 * @param {function} next - Siguiente middleware
 */
export const requestPause = async (req, res, next) => {
    try {
        const { matchId } = req.params;
        const { accept } = req.body;

        const partida = await Match.findByPk(matchId);
        if (!partida) return res.status(404).json({ message: 'Partida no encontrada' });

        if (accept === true) {
            partida.status = 'WAITING';
            await partida.save();
            return res.json({ message: 'Pausa aceptada. Partida en espera.', status: partida.status });
        }

        res.json({ message: 'Solicitud de pausa enviada al oponente', matchId });
    } catch (error) {
        next(error);
    }
};

/**
 * Obtiene el historial de partidas del usuario
 * @param {object} req - Petición Express
 * @param {object} res - Respuesta Express
 * @param {function} next - Siguiente middleware
 */
export const getMatchHistory = async (req, res, next) => {
    try {
        const partidas = await Match.findAll({
            include: [{ model: MatchPlayer, where: { userId: req.user.id } }],
            order: [['created_at', 'DESC']]
        });
        res.json(partidas);
    } catch (error) {
        next(error);
    }
};