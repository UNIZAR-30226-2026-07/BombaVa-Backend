/**
 * Manejador de eventos de Socket para la fase de Lobby.
 * Utiliza la identidad del usuario vinculada al socket.
 */
import { services } from '../../../shared/index.js';

const { lobbyService } = services;

export const registerLobbyHandlers = (io, socket) => {

    /**
     * Crea un nuevo lobby.
     */
    socket.on('lobby:create', () => {
        const userId = socket.data.user.id;
        const codigo = lobbyService.crearLobby(userId, socket.id);

        socket.join(codigo);
        socket.emit('lobby:created', { codigo });
    });

    /**
     * Une al jugador a un lobby existente por código.
     */
    socket.on('lobby:join', async (datos) => {
        try {
            const { codigo } = datos;
            const userId = socket.data.user.id;

            const lobby = lobbyService.intentarUnirseALobby(codigo, userId, socket.id);
            socket.join(codigo);

            if (lobby.length === 2) {
                const partida = await lobbyService.ejecutarInicioPartida(codigo, lobby);
                io.to(codigo).emit('match:ready', {
                    matchId: partida.id,
                    status: partida.status,
                    turnNumber: partida.turnNumber
                });
                //Manda a cada juador por privado info de la partida y de su flota
                for (const jugador of lobby) {
                    const infoJugador = await lobbyService.obtenerInfoJugador(partida.id, jugador.id);
                    io.to(jugador.socketId).emit('match:startInfo', infoJugador);
                }
            }
        } catch (error) {
            socket.emit('lobby:error', { message: error.message });
        }
    });
};