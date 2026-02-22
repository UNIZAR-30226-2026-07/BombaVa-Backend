/**
 * Punto de entrada principal del servidor.
 * Registra los manejadores de eventos mediante el patrón de fachada por directorio.
 */
import { createServer } from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import { connectDB } from './config/db.js';
import { socketProtect } from './shared/middlewares/socketMiddleware.js';
import { syncModels } from './shared/models/index.js';
import runSeeder from './shared/models/seed.js';
import { registerGameHandlers } from './shared/sockets/gameHandler/index.js';
import { registerLobbyHandlers } from './shared/sockets/lobbyHandler/index.js';

const PORT = process.env.PORT || 3000;
const server = createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

/**
 * Seguridad global en la capa de Sockets.
 */
io.use(socketProtect);

io.on('connection', (socket) => {
    registerLobbyHandlers(io, socket);
    registerGameHandlers(io, socket);

    socket.on('disconnect', () => {
        console.log(`Jugador desconectado: ${socket.id}`);
    });
});

const startServer = async () => {
    await connectDB();
    await syncModels();
    if (process.env.NODE_ENV === 'development') await runSeeder();
    server.listen(PORT, () => console.log(`SERVIDOR BOMBA-VA en puerto ${PORT}`));
};

startServer();