import { Match, MatchPlayer, Projectile, ShipInstance } from '../../../shared/models/index.js';

/**
 * Recupera el estado de la partida filtrando la información sensible
 * @param {object} req - Objeto de petición de Express
 * @param {object} res - Objeto de respuesta de Express
 * @param {function} next - Función para manejo de errores
 */
export const getMatchStatus = async (req, res, next) => {
    try {
        const { matchId } = req.params;
        const partida = await Match.findByPk(matchId, {
            include: [
                { model: MatchPlayer },
                { model: ShipInstance },
                { model: Projectile }
            ]
        });

        if (!partida) {
            return res.status(404).json({ message: 'Partida no encontrada' });
        }

        res.json(partida);
    } catch (error) {
        next(error);
    }
};

/**
 * Gestiona la petición de pausa que debe ser aceptada por el oponente
 * @param {object} req - Objeto de petición de Express
 * @param {object} res - Objeto de respuesta de Express
 * @param {function} next - Función para manejo de errores
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

        res.json({ message: 'Solicitud de pausa enviada', matchId });
    } catch (error) {
        next(error);
    }
};

/**
 * Recupera el historial de partidas del usuario autenticado
 * @param {object} req - Objeto de petición de Express
 * @param {object} res - Objeto de respuesta de Express
 * @param {function} next - Función para manejo de errores
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