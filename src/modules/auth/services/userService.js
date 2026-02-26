/**
 * Servicio de Usuario
 * Gestiona los datos del perfil y el cálculo de ranking ELO.
 */
import User from '../models/User.js';

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

/**
 * Actualiza los datos básicos del usuario
 */
export const actualizarPerfil = async (userId, nuevosDatos) => {
    const usuario = await User.findByPk(userId);
    if (!usuario) throw new Error('Usuario no encontrado');

    return await usuario.update(nuevosDatos);
};

/**
 * Calcula y aplica el cambio de ELO tras una partida
 * @param {string} winnerId 
 * @param {string} loserId 
 */
export const procesarResultadoElo = async (winnerId, loserId) => {
    const ganador = await User.findByPk(winnerId);
    const perdedor = await User.findByPk(loserId);

    if (!ganador || !perdedor) return;

    const K = 32;
    const probGanador = 1 / (1 + Math.pow(10, (perdedor.elo_rating - ganador.elo_rating) / 400));

    const nuevoEloGanador = Math.round(ganador.elo_rating + K * (1 - probGanador));
    const nuevoEloPerdedor = Math.round(perdedor.elo_rating + K * (0 - (1 - probGanador)));

    await Promise.all([
        ganador.update({ elo_rating: nuevoEloGanador }),
        perdedor.update({ elo_rating: nuevoEloPerdedor })
    ]);
};