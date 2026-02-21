import User from '../models/User.js';

/**
 * Recupera los datos del perfil del usuario autenticado
 * @param {object} req - Petición de Express
 * @param {object} res - Respuesta de Express
 * @param {function} next - Middleware de error
 */
export const getProfile = async (req, res, next) => {
    try {
        const usuario = await User.findByPk(req.user.id, {
            attributes: ['id', 'username', 'email', 'elo_rating', 'created_at']
        });
        res.json(usuario);
    } catch (error) {
        next(error);
    }
};

/**
 * Obtiene el ranking global de jugadores basado en su ELO
 * @param {object} req - Petición de Express
 * @param {object} res - Respuesta con la lista de jugadores
 * @param {function} next - Middleware de error
 */
export const getLeaderboard = async (req, res, next) => {
    try {
        const jugadores = await User.findAll({
            attributes: ['username', 'elo_rating'],
            order: [['elo_rating', 'DESC']],
            limit: 50
        });
        res.json(jugadores);
    } catch (error) {
        next(error);
    }
};