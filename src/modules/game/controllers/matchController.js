import { Match } from '../../../shared/models/index.js';
import * as matchService from '../services/matchService.js';

/**
 * Consulta de estado
 */
export const getMatchStatus = async (req, res, next) => {
    try {
        const partida = await matchService.obtenerEstadoCompletoPartida(req.params.matchId);
        if (!partida) return res.status(404).json({ message: 'Partida no encontrada' });
        res.json(partida);
    } catch (error) {
        next(error);
    }
};

/**
 * Gestión de pausas
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
 * Historial de usuario
 */
export const getMatchHistory = async (req, res, next) => {
    try {
        const partidas = await matchService.obtenerHistorialUsuario(req.user.id);
        res.json(partidas);
    } catch (error) {
        next(error);
    }
};