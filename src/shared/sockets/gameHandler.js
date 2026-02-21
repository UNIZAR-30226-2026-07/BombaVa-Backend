/**
 * Gestiona la comunicación de acciones de juego y estado de partida
 * @param {object} io - Instancia de Socket.io
 * @param {object} socket - Socket del cliente
 */
export const registerGameHandlers = (io, socket) => {

    socket.on('game:action:emit', (datos) => {
        const { matchId, action, payload } = datos;
        socket.to(matchId).emit('game:action:received', { action, payload });
    });

    socket.on('game:vision:update', (datos) => {
        const { matchId, userId, discovered, hidden } = datos;
        io.to(matchId).emit(`game:vision:update:${userId}`, { discovered, hidden });
    });

    socket.on('match:pause_request', (datos) => {
        const { matchId } = datos;
        socket.to(matchId).emit('match:pause_requested', { from: socket.id });
    });

    socket.on('match:pause_response', (datos) => {
        const { matchId, accepted } = datos;
        socket.to(matchId).emit('match:pause_resolved', { accepted });
    });

    socket.on('match:surrender_emit', (datos) => {
        const { matchId } = datos;
        socket.to(matchId).emit('match:opponent_surrendered');
    });

    socket.on('match:join_room', (matchId) => {
        socket.join(matchId);
    });
};