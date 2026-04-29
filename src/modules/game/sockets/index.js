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
import { matchService, statusService } from '../services/index.js';


// Key: matchId, Value: userId del solicitante
const pausasPendientes = new Map();
// Key: matchId, Value: Timeout
const disconnectTimers = new Map(); 

// Función para limpiar timers (solo para tests)
export const clearGameTimers = () => {
    for (const timer of disconnectTimers.values()) {
        clearTimeout(timer);
    }
    disconnectTimers.clear();
    pausasPendientes.clear();
};

export const registerGameHandlers = (io, socket) => {

    /**
     * RF-506: Comprobación automática de reconexión al abrir la app.
     */
    socket.on('game:check_active', async () => {
        try {
            const userId = socket.data.user.id;
            const activeMatch = await MatchDao.findActiveMatchByUser(userId);
            
            if (activeMatch) {
                socket.emit('game:active_found', { matchId: activeMatch.id });
            } else {
                socket.emit('game:no_active');
            }
        } catch (error) {
            socket.emit('game:error', { message: 'Error al buscar partidas activas' });
        }
    });

    /**
     * Entrar o Reconectarse a la sala
     */
    socket.on('game:join', async (matchId) => {

        const matchId = typeof data === 'string' ? data : data.matchId;

        if (!matchId) return;

        socket.join(matchId);
        socket.emit('game:joined', { matchId });

        // RF-506: Si había un timer de desconexión, el usuario ha vuelto a tiempo. Lo cancelamos.
        if (disconnectTimers.has(matchId)) {
            clearTimeout(disconnectTimers.get(matchId));
            disconnectTimers.delete(matchId);
            
            // Avisamos al oponente
            socket.to(matchId).emit('match:player_reconnected', {
                message: 'El oponente se ha reconectado. La partida continúa.'
            });
        }

        // Enviamos el snapshot exacto del estado actual de la partida al que acaba de entrar
        try {
            const snapshot = await matchService.obtenerEstadoCompletoPartida(matchId, socket.data.user.id);
            socket.emit('match:startInfo', snapshot);
        } catch (error) {
            if (error instanceof ReferenceError || error instanceof TypeError) {
                console.error("Error crítico en game:join :", error);
            }
            // Ignoramos si es un join inicial donde el match no está totalmente orquestado aún
        }
    });

/**
     * RF-505: Gestión de caídas de red y abandono
     */
    socket.on('disconnect', async () => {
        try {
            const userId = socket.data.user?.id;
            if (!userId) return;

            const activeMatch = await MatchDao.findActiveMatchByUser(userId);
            
            if (activeMatch) {
                const matchId = activeMatch.id;
                
                io.to(matchId).emit('match:player_disconnected', {
                    message: 'El oponente ha perdido la conexión. Esperando reconexión (2 min)...',
                    userId: userId
                });

                if (!disconnectTimers.has(matchId)) {
                    const timer = setTimeout(async () => {
                        try {
                            const partida = await MatchDao.findById(matchId);
                            if (partida && partida.status === 'PLAYING') {
                                const oponente = partida.MatchPlayers.find(p => p.userId !== userId);
                                if (oponente) {
                                    await statusService.registrarVictoria(matchId, oponente.userId);
                                    io.to(matchId).emit('match:finished', {
                                        winnerId: oponente.userId,
                                        reason: 'abandonment'
                                    });
                                }
                            }
                            disconnectTimers.delete(matchId);
                        } catch (e) {
                            // Silenciar errores internos del timer si la BBDD ya cerró
                        }
                    }, 2 * 60 * 1000); 

                    // Evita que Jest se quede colgado esperando los 2 minutos
                    timer.unref(); 

                    disconnectTimers.set(matchId, timer);
                }
            }
        } catch (error) {
            // Si el error es porque Sequelize ya se cerró (durante el afterAll de los tests), lo ignoramos.
            if (error.message.includes('ConnectionManager.getConnection')) {
                return;
            }
            console.error('Error procesando desconexión:', error.message);
        }
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