/**
 * Servicio de Usuario
 * Gestiona los datos del perfil, actualizaciones seguras y el cálculo de ranking ELO.
 */
import User from '../models/User.js';
import { cifrarContrasena, verificarContrasena } from './authService.js';

/**
 * Obtiene el perfil privado de un usuario.
 */
export const obtenerPerfilPrivado = async (userId) => {
    return await User.findByPk(userId, {
        attributes: ['id', 'username', 'email', 'elo_rating', 'created_at']
    });
};

/**
 * Obtiene la clasificación global de jugadores.
 */
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
 * Cambia la contraseña del usuario validando la credencial anterior.
 * @param {string} userId - UUID del usuario.
 * @param {string} oldPassword - Contraseña actual en texto plano.
 * @param {string} newPassword - Nueva contraseña en texto plano.
 */
export const cambiarContrasena = async (userId, oldPassword, newPassword) => {
    const usuario = await User.findByPk(userId);
    if (!usuario) throw new Error('Usuario no encontrado');

    const isMatch = await verificarContrasena(oldPassword, usuario.password_hash);
    if (!isMatch) throw new Error('La contraseña actual es incorrecta');

    const newHash = await cifrarContrasena(newPassword);
    return await usuario.update({ password_hash: newHash });
};

/**
 * Calcula y aplica el cambio de ELO tras una partida.
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