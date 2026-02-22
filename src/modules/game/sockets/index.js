/**
 * Fachada de Sockets del Módulo Game.
 * Registra los manejadores de lobby, turnos y gestión de sala.
 * 
 * @param {Object} io - Instancia de Socket.io.
 * @param {Object} socket - Socket del cliente.
 */
import { registerLobbyHandlers } from './lobby.js';
import { registerTurnHandlers } from './turn.js';

export const registerGameHandlers = (io, socket) => {
    /**
     * Gestión de entrada a la sala de partida.
     */
    socket.on('game:join', (matchId) => {
        socket.join(matchId);
    });

    /**
     * Gestión de pausas (Sincronización simple).
     */
    socket.on('match:pause_request', (data) => {
        const { matchId } = data;
        socket.to(matchId).emit('match:pause_requested', {
            from: socket.data.user.username
        });
    });

    registerLobbyHandlers(io, socket);
    registerTurnHandlers(io, socket);
};