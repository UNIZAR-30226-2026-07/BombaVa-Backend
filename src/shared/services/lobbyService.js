/**
 * Servicio de Lobbies
 * Gestiona las salas de espera y orquesta el inicio de partidas llamando al MatchService.
 */
import * as matchService from '../../modules/game/services/matchService.js';
import { MatchDao } from '../../modules/game/dao/index.js';

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
    const [user1, user2] = lobby;
    
    // Comprobar si existe una partida pausada entre estos dos jugadores
    const partidaPausada = await MatchDao.findPausedMatchBetweenUsers(user1.id, user2.id);
    
    let partida;
    if (partidaPausada) {
        // Reanudamos la partida existente
        partida = await MatchDao.updateStatus(partidaPausada.id, 'PLAYING');
    } else {
        // Arrancamos una nueva
        partida = await matchService.iniciarPartidaOrquestada(lobby);
    }

    // Si es una partida de BOT, el código no está en lobbiesActivos, así que lo ignoramos sin romper nada
    if (lobbiesActivos.has(codigo)) {
        lobbiesActivos.delete(codigo);
    }
    return partida;
};

export const obtenerInfoJugador = async (matchId, userId) =>{
    return await matchService.obtenerEstadoCompletoPartida(matchId, userId);
}