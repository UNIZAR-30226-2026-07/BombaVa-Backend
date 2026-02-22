/**
 * Fachada principal del manejador de juego (GameHandler).
 * Orquesta los eventos de movimiento, combate y flujo de partida.
 * 
 * @param {Object} io - Instancia global de Socket.io.
 * @param {Object} socket - Socket del cliente autenticado.
 */
import { registerCombatHandlers } from './combat.js';
import { registerMovementHandlers } from './movement.js';
import { registerTurnHandlers } from './turn.js';

export const registerGameHandlers = (io, socket) => {
    /**
     * Gestión de salas (Rooms).
     */
    socket.on('game:join', (matchId) => {
        socket.join(matchId);
    });

    /**
     * Registro de sub-módulos internos de la fachada.
     */
    registerMovementHandlers(io, socket);
    registerCombatHandlers(io, socket);
    registerTurnHandlers(io, socket);

    /**
     * Gestión de pausas.
     */
    socket.on('match:pause_request', (data) => {
        const { matchId } = data;
        socket.to(matchId).emit('match:pause_requested', {
            from: socket.data.user.username
        });
    });
};