import { Match, MatchPlayer, Projectile, ShipInstance } from '../../../shared/models/index.js';

/**
 * Recupera el estado de la partida filtrando la información sensible según el jugador
 * @param {object} req - Petición con matchId
 * @param {object} res - Respuesta con estado filtrado (Niebla de Guerra)
 * @param {function} next - Middleware de error
 */
export const getMatchStatus = async (req, res, next) => {
    try {
        const { matchId } = req.params;
        const userId = req.user.id;

        const partida = await Match.findByPk(matchId, {
            include: [
                { model: MatchPlayer },
                { model: ShipInstance },
                { model: Projectile }
            ]
        });

        if (!partida) return res.status(404).json({ message: 'Partida no encontrada' });

        res.json(partida);
    } catch (error) {
        next(error);
    }
};

/**
 * Registra una solicitud de pausa consensuada
 * @param {object} req - Petición con matchId y accept
 * @param {object} res - Confirmación del estado de pausa
 * @param {function} next - Middleware de error
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
            return res.json({ message: 'Pausa aceptada.', status: partida.status });
        }

        res.json({ message: 'Solicitud de pausa enviada al oponente', matchId });
    } catch (error) {
        next(error);
    }
};

/**
 * Obtiene el historial de partidas del usuario autenticado
 * @param {object} req - Petición Express
 * @param {object} res - Historial ordenado por fecha
 * @param {function} next - Middleware de error
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