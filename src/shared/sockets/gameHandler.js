/**
 * Gestiona la comunicación de acciones de juego entre oponentes
 * @param {object} io - Instancia de Socket.io
 * @param {object} socket - Socket del cliente
 */
export const registerGameHandlers = (io, socket) => {

    socket.on('game:action:emit', (datos) => {
        const { matchId, action, payload } = datos;
        socket.to(matchId).emit('game:action:received', { action, payload });
    });

    socket.on('match:join_room', (matchId) => {
        socket.join(matchId);
    });
};