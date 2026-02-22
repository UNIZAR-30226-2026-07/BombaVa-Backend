/**
 * Servicio de Lobbies
 * Gestiona las salas de espera en memoria y orquesta el inicio de partidas en la DB.
 */
import { initializeMatchPersistence } from '../../modules/game/controllers/matchSetupController.js';

const lobbiesActivos = new Map();

/**
 * Crea un identificador de sala único y registra al primer jugador
 * @param {string} userId - ID del usuario host
 * @param {string} socketId - ID del socket del host
 */
export const crearLobby = (userId, socketId) => {
    const codigo = Math.random().toString(36).substring(2, 8).toUpperCase();
    lobbiesActivos.set(codigo, [{ id: userId, socketId }]);
    return codigo;
};

/**
 * Añade un segundo jugador a la sala si hay espacio
 * @param {string} codigo - Código de la sala
 * @param {string} userId - ID del usuario invitado
 * @param {string} socketId - ID del socket del invitado
 */
export const intentarUnirseALobby = (codigo, userId, socketId) => {
    const lobby = lobbiesActivos.get(codigo);

    if (!lobby) {
        throw new Error('Lobby no encontrado');
    }
    if (lobby.length >= 2) {
        throw new Error('Lobby lleno');
    }

    lobby.push({ id: userId, socketId });
    return lobby;
};

/**
 * Finaliza el lobby y persiste la partida en la base de datos
 * @param {string} codigo - Código de la sala
 * @param {Array} lobby - Lista de jugadores en la sala
 */
export const ejecutarInicioPartida = async (codigo, lobby) => {
    const partida = await initializeMatchPersistence(lobby);
    lobbiesActivos.delete(codigo);
    return partida;
};