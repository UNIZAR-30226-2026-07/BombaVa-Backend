/**
 * Manejador de eventos de Socket para la sesión de la partida (unión y pausas).
 */
import MatchDao from '../dao/MatchDao.js';

export const registerSessionHandlers = (io, socket) => {
    
    /**
     * Gestión de entrada a la sala de partida.
     */
    socket.on('game:join', (matchId) => {
        socket.join(matchId);
        socket.emit('game:joined', { matchId });
    });

    /**
     * RF-501: Solicitud de pausa
     */
    socket.on('match:pause_request', async (data) => {
        try {
            const { matchId } = data;
            const partida = await MatchDao.findById(matchId);
            
            if (partida && partida.status === 'PLAYING') {
                socket.to(matchId).emit('match:pause_requested', {
                    from: socket.data.user.username
                });
            }
        } catch (error) {
            socket.emit('game:error', { message: error.message });
        }
    });

    /**
     * RF-502: Aceptar pausa
     */
    socket.on('match:pause_accept', async (data) => {
        try {
            const { matchId } = data;
            const partida = await MatchDao.findById(matchId);
            
            if (partida && partida.status === 'PLAYING') {
                await MatchDao.updateStatus(matchId, 'WAITING'); // Congela la partida
                io.to(matchId).emit('match:paused', { 
                    message: 'La partida ha sido pausada por mutuo acuerdo.' 
                });
            }
        } catch (error) {
            socket.emit('game:error', { message: error.message });
        }
    });

    /**
     * RF-502: Rechazar pausa
     */
    socket.on('match:pause_reject', (data) => {
        const { matchId } = data;
        socket.to(matchId).emit('match:pause_rejected', {
            message: 'El oponente ha rechazado la solicitud de pausa.'
        });
    });
};