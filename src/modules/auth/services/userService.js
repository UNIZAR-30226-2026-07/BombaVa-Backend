import User from '../models/User.js';

/**
 * Lógica de negocio para datos de usuario y rankings
 */

export const obtenerPerfilPrivado = async (userId) => {
    return await User.findByPk(userId, {
        attributes: ['id', 'username', 'email', 'elo_rating', 'created_at']
    });
};

export const obtenerClasificacionGlobal = async (limite = 50) => {
    return await User.findAll({
        attributes: ['username', 'elo_rating'],
        order: [['elo_rating', 'DESC']],
        limit: limite
    });
};