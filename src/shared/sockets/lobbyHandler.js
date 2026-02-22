import * as lobbyService from '../services/lobbyService.js';

/**
 * Manejador de eventos de socket para la fase de lobby (Capa de API)
 * @param {object} io 
 * @param {object} socket 
 */
export const registerLobbyHandlers = (io, socket) => {

    socket.on('lobby:create', (datos) => {
        const codigo = lobbyService.crearLobby(datos.userId, socket.id);
        socket.join(codigo);
        socket.emit('lobby:created', { codigo });
    });

    socket.on('lobby:join', async (datos) => {
        try {
            const { codigo, userId } = datos;
            const lobby = lobbyService.intentarUnirseALobby(codigo, userId, socket.id);

            socket.join(codigo);

            if (lobby.length === 2) {
                const partida = await lobbyService.ejecutarInicioPartida(codigo, lobby);
                io.to(codigo).emit('match:ready', { matchId: partida.id, status: partida.status });
            }
        } catch (error) {
            socket.emit('lobby:error', { message: error.message });
        }
    });
};