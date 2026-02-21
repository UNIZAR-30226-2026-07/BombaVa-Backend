/**
 * Main Entry Point
 * Inicializa Base de Datos, Servidor HTTP y WebSockets.
 */
import { createServer } from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import { connectDB } from './config/db.js';
import { initializeMatchPersistence } from './modules/game/controllers/matchController.js';
import { syncModels } from './shared/models/index.js';
import runSeeder from './shared/models/seed.js';

const PORT = process.env.PORT || 3000;
const server = createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
    }
});

/**
 * Almacenamiento volátil de lobbies activos
 * Formato: { "CODIGO": [ {id, socketId}, ... ] }
 */
const lobbiesActivos = new Map();

io.on('connection', (socket) => {
    console.log(`Jugador conectado: ${socket.id}`);

    /**
     * Crea un nuevo lobby privado y genera un código único
     */
    socket.on('lobby:create', (datos) => {
        const codigo = Math.random().toString(36).substring(2, 8).toUpperCase();
        lobbiesActivos.set(codigo, [{ id: datos.userId, socketId: socket.id }]);

        socket.join(codigo);
        socket.emit('lobby:created', { codigo });
    });

    /**
     * Une a un jugador a un lobby existente mediante código
     */
    socket.on('lobby:join', async (datos) => {
        const { codigo, userId } = datos;
        const lobby = lobbiesActivos.get(codigo);

        if (!lobby) {
            return socket.emit('lobby:error', { message: 'Lobby no encontrado' });
        }

        if (lobby.length >= 2) {
            return socket.emit('lobby:error', { message: 'Lobby lleno' });
        }

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

    socket.on('disconnect', () => {
        console.log(`Jugador desconectado`);
    });
});

const startServer = async () => {
    await connectDB();
    await syncModels();

    if (process.env.NODE_ENV === 'development') {
        await runSeeder();
    }

    server.listen(PORT, () => {
        console.log('---------------------------------------------');
        console.log(`SERVIDOR BOMBA-VA`);
        console.log(`URL: http://localhost:${PORT}`);
        console.log('---------------------------------------------');
    });
};

startServer();