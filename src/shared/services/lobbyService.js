import { initializeMatchPersistence } from '../../modules/game/controllers/matchSetupController.js';

/**
 * Servicio para la gestión de la lógica de lobbies y emparejamiento volátil
 */

const lobbiesActivos = new Map();

export const crearLobby = (userId, socketId) => {
    const codigo = Math.random().toString(36).substring(2, 8).toUpperCase();
    lobbiesActivos.set(codigo, [{ id: userId, socketId }]);
    return codigo;
};

export const intentarUnirseALobby = (codigo, userId, socketId) => {
    const lobby = lobbiesActivos.get(codigo);

    if (!lobby) throw new Error('Lobby no encontrado');
    if (lobby.length >= 2) throw new Error('Lobby lleno');

    lobby.push({ id: userId, socketId });
    return lobby;
};

export const ejecutarInicioPartida = async (codigo, lobby) => {
    const partida = await initializeMatchPersistence(lobby);
    lobbiesActivos.delete(codigo);
    return partida;
};