/**
 * Controlador de Usuarios
 * Gestiona el acceso y modificación de datos del jugador.
 */
import { validationResult } from 'express-validator';
import * as userService from '../services/userService.js';

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

/**
 * Actualiza el perfil del usuario autenticado
 */
export const updateProfile = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
        const { username, email } = req.body;
        const actualizado = await userService.actualizarPerfil(req.user.id, { username, email });
        res.json({
            message: 'Perfil actualizado',
            user: { username: actualizado.username, email: actualizado.email }
        });
    } catch (error) {
        next(error);
    }
};