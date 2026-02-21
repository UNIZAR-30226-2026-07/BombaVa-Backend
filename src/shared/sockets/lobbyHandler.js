import { initializeMatchPersistence } from '../../modules/game/controllers/matchSetupController.js';

/**
 * Gestiona los eventos de creación y unión a lobbies privados
 * @param {object} io - Instancia de Socket.io
 * @param {object} socket - Socket del cliente
 * @param {Map} lobbiesActivos - Mapa volátil de salas
 */
export const registerLobbyHandlers = (io, socket, lobbiesActivos) => {

    socket.on('lobby:create', (datos) => {
        const codigo = Math.random().toString(36).substring(2, 8).toUpperCase();
        lobbiesActivos.set(codigo, [{ id: datos.userId, socketId: socket.id }]);
        socket.join(codigo);
        socket.emit('lobby:created', { codigo });
    });

    socket.on('lobby:join', async (datos) => {
        const { codigo, userId } = datos;
        const lobby = lobbiesActivos.get(codigo);

        if (!lobby) return socket.emit('lobby:error', { message: 'Lobby no encontrado' });
        if (lobby.length >= 2) return socket.emit('lobby:error', { message: 'Lobby lleno' });

        lobby.push({ id: userId, socketId: socket.id });
        socket.join(codigo);

        if (lobby.length === 2) {
            try {
                const partida = await initializeMatchPersistence(lobby);
                io.to(codigo).emit('match:ready', {
                    matchId: partida.id,
                    status: partida.status
                });
                lobbiesActivos.delete(codigo);
            } catch (error) {
                io.to(codigo).emit('lobby:error', { message: 'Error al iniciar partida' });
            }
        }
    });
};