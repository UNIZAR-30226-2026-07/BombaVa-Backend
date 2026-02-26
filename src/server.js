/**
 * Punto de entrada principal del servidor.
 * Coordina la conexión, sincronización y registro de manejadores modulares.
 */
import { createServer } from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import { connectDB } from './config/index.js';
import { socketProtect } from './shared/middlewares/index.js';
import { syncModels } from './shared/models/index.js';
import runSeeder from './shared/models/seed.js';

import { registerEngineHandlers } from './modules/engine/index.js';
import { registerGameHandlers } from './modules/game/index.js';

const PORT = process.env.PORT || 3000;
const server = createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

/**
 * Seguridad de sockets.
 */
io.use(socketProtect);

io.on('connection', (socket) => {
    // Registro mediante fachadas modulares
    registerEngineHandlers(io, socket);
    registerGameHandlers(io, socket);

    socket.on('disconnect', () => {
        console.log(`Jugador desconectado: ${socket.data.user.username}`);
    });
});

/**
 * Arranque del sistema.
 */
const startServer = async () => {
    await connectDB();
    await syncModels();
    if (process.env.NODE_ENV === 'development') await runSeeder();
    server.listen(PORT, () => console.log(`SERVIDOR BOMBA-VA V1 - PUERTO: ${PORT}`));
};

startServer();