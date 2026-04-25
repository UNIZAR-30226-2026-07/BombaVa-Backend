/**
 * Fachada de Sockets del Módulo Game.
 * Registra los manejadores de lobby, turnos y gestión de sala.
 * 
 * @param {Object} io - Instancia de Socket.io.
 * @param {Object} socket - Socket del cliente.
 */
import { registerLobbyHandlers } from './lobby.js';
import { registerTurnHandlers } from './turn.js';
import { MatchDao } from '../dao/index.js';


// Key: matchId, Value: userId del solicitante
const pausasPendientes = new Map();

export const registerGameHandlers = (io, socket) => {
    /**
     * Gestión de entrada a la sala de partida.
     * Envía confirmación al cliente para evitar condiciones de carrera.
     */
    socket.on('game:join', (matchId) => {
        socket.join(matchId);
        socket.emit('game:joined', { matchId });
    });

    /**
     * RF 501: Gestión de pausas
     */
    socket.on('match:pause_request', async (data) => {
        const { matchId } = data;
        const userId = socket.data.user.id;

        const partida = await MatchDao.findById(matchId);
        
        if (partida && partida.status === 'PLAYING') {
            // Guardamos quién inició la petición
            pausasPendientes.set(matchId, userId);
            socket.to(matchId).emit('match:pause_requested', {
                from: socket.data.user.username
            });
        }
    });

    /**
     * RF-502: Aceptar pausa
     */
    socket.on('match:pause_accept', async (data) => {
        const { matchId } = data;
        const userId = socket.data.user.id;

        const solicitanteId = pausasPendientes.get(matchId);
        
        if (!solicitanteId) {
            return socket.emit('game:error', { message: 'No hay ninguna solicitud de pausa pendiente.' });
        }

        if (solicitanteId === userId) {
            return socket.emit('game:error', { message: 'No puedes aceptar tu propia solicitud de pausa.' });
        }

        const partida = await MatchDao.findById(matchId);
        if (partida && partida.status === 'PLAYING') {
            await MatchDao.updateStatus(matchId, 'WAITING');
            pausasPendientes.delete(matchId); 
            
            io.to(matchId).emit('match:paused', { 
                message: 'La partida ha sido pausada por mutuo acuerdo.' 
            });
        }
    });

    /**
     * RF-502: Rechazar pausa
     */
    socket.on('match:pause_reject', async (data) => {
        const { matchId } = data;
        const userId = socket.data.user.id;

        const solicitanteId = pausasPendientes.get(matchId);

        if (!solicitanteId || solicitanteId === userId) {
            return socket.emit('game:error', { message: 'No puedes rechazar esta solicitud o no existe.' });
        }

        pausasPendientes.delete(matchId);
        
        socket.to(matchId).emit('match:pause_rejected', {
            message: 'El oponente ha rechazado la solicitud de pausa.'
        });
    });

    registerLobbyHandlers(io, socket);
    registerTurnHandlers(io, socket);
};