/**
 * Manejador de eventos de Socket para la fase de Lobby.
 * Gestiona la creación de salas privadas y la unión de jugadores.
 * 
 * @param {Object} io - Instancia global de Socket.io.
 * @param {Object} socket - Socket del cliente autenticado.
 */
import * as lobbyService from '../services/lobbyService.js';

export const registerLobbyHandlers = (io, socket) => {

    /**
     * Crea un nuevo lobby y devuelve el código al host.
     */
    socket.on('lobby:create', (datos) => {
        const codigo = lobbyService.crearLobby(datos.userId, socket.id);
        socket.join(codigo);
        socket.emit('lobby:created', { codigo });
    });

    /**
     * Une a un jugador a un lobby existente por código.
     * Si la sala se llena, orquesta el inicio de la partida.
     */
    socket.on('lobby:join', async (datos) => {
        try {
            const { codigo, userId } = datos;
            const lobby = lobbyService.intentarUnirseALobby(codigo, userId, socket.id);

            socket.join(codigo);

            if (lobby.length === 2) {
                const partida = await lobbyService.ejecutarInicioPartida(codigo, lobby);

                io.to(codigo).emit('match:ready', {
                    matchId: partida.id,
                    status: partida.status,
                    turnNumber: partida.turnNumber
                });
            }
        } catch (error) {
            socket.emit('lobby:error', { message: error.message });
        }
    });
};