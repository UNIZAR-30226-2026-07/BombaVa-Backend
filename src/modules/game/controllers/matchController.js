/**
 * Controlador de Partidas (Consultas REST).
 * Solo gestiona peticiones asíncronas de lectura (Historial).
 */
import * as matchService from '../services/matchService.js';

/**
 * Recupera el historial de partidas del usuario autenticado.
 * 
 * @param {Object} req - Petición Express.
 * @param {Object} res - Respuesta Express.
 * @param {Function} next - Middleware de error.
 */
export const getMatchHistory = async (req, res, next) => {
    try {
        const partidas = await matchService.obtenerHistorialUsuario(req.user.id);
        res.json(partidas);
    } catch (error) {
        next(error);
    }
};