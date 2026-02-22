/**
 * Servicio de Lobbies
 * Gestiona las salas de espera y orquesta el inicio de partidas llamando al MatchService.
 */
import * as matchService from '../../modules/game/services/matchService.js';

const lobbiesActivos = new Map();

/**
 * Crea un lobby y registra al host
 */
export const crearLobby = (userId, socketId) => {
    const codigo = Math.random().toString(36).substring(2, 8).toUpperCase();
    lobbiesActivos.set(codigo, [{ id: userId, socketId }]);
    return codigo;
};

/**
 * Une a un invitado al lobby
 */
export const intentarUnirseALobby = (codigo, userId, socketId) => {
    const lobby = lobbiesActivos.get(codigo);

    if (!lobby) throw new Error('Lobby no encontrado');
    if (lobby.length >= 2) throw new Error('Lobby lleno');

    lobby.push({ id: userId, socketId });
    return lobby;
};

/**
 * Finaliza el lobby y arranca la partida en la DB vía MatchService
 */
export const ejecutarInicioPartida = async (codigo, lobby) => {
    const partida = await matchService.iniciarPartidaOrquestada(lobby);
    lobbiesActivos.delete(codigo);
    return partida;
};