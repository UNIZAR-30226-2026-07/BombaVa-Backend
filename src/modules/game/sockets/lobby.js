/**
 * Manejador de eventos de Socket para la fase de Lobby.
 * Utiliza la identidad del usuario vinculada al socket.
 */
import { services } from '../../../shared/index.js';
import { BOT_UUID } from '../../../shared/models/bootstrap.js';
import { MatchDao } from '../dao/index.js';

const { lobbyService } = services;

export const registerLobbyHandlers = (io, socket) => {

    /**
     * RF-601: Iniciar partida directa contra la IA.
     */
    socket.on('game:play_bot', async () => {
        try {
            const userId = socket.data.user.id;
            
            // Verificamos si ya hay una partida pausada/activa contra el bot
            const partidaPausada = await MatchDao.findPausedMatchBetweenUsers(userId, BOT_UUID);
            
            let partida;
            if (partidaPausada) {
                partida = await MatchDao.updateStatus(partidaPausada.id, 'PLAYING');
            } else {
                // Creamos el array simulando un lobby completado (Humano vs Bot)
                const mockLobby = [
                    { id: userId, socketId: socket.id },
                    { id: BOT_UUID, socketId: null } // El bot no tiene socket físico
                ];
                
                // Ejecutamos el orquestador
                partida = await lobbyService.ejecutarInicioPartida('BOT_MATCH', mockLobby);
            }

            io.to(socket.id).emit('match:ready', {
                matchId: partida.id,
                status: partida.status,
                turnNumber: partida.turnNumber
            });

            // Solo enviamos startInfo al humano, ya que el bot no tiene socket
            const infoJugador = await lobbyService.obtenerInfoJugador(partida.id, userId);
            io.to(socket.id).emit('match:startInfo', infoJugador);

            // Si al iniciar, resulta que es el turno del Bot, le damos el paso
            if (partida.currentTurnPlayerId === BOT_UUID) {
                // TODO Llamar al aiService para que el bot empiece a pensar
            }

        } catch (error) {
            socket.emit('lobby:error', { message: error.message });
        }
    });


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