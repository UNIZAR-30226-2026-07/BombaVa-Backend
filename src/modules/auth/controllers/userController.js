import * as userService from '../services/userService.js';

/**
 * Perfil de usuario
 */
export const getProfile = async (req, res, next) => {
    try {
        const usuario = await userService.obtenerPerfilPrivado(req.user.id);
        res.json(usuario);
    } catch (error) {
        next(error);
    }
};

/**
 * Ranking global
 */
export const getLeaderboard = async (req, res, next) => {
    try {
        const jugadores = await userService.obtenerClasificacionGlobal(50);
        res.json(jugadores);
    } catch (error) {
        next(error);
    }
};