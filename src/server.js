/**
 * Punto de entrada principal del servidor BombaVa.
 * Configura la seguridad de Sockets y distribuye los eventos por módulos.
 */
import { createServer } from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import { connectDB } from './config/db.js';
import { socketProtect } from './shared/middlewares/socketMiddleware.js';
import { syncModels } from './shared/models/index.js';
import runSeeder from './shared/models/seed.js';

// Importación de fachadas modulares
import { registerEngineHandlers } from './modules/engine/sockets/index.js';
import { registerGameHandlers } from './modules/game/sockets/index.js';

const PORT = process.env.PORT || 3000;
const server = createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

/**
 * Autenticación obligatoria para cada conexión de Socket.
 */
io.use(socketProtect);

io.on('connection', (socket) => {
    // El socket se auto-registra en las fachadas de cada módulo
    registerEngineHandlers(io, socket);
    registerGameHandlers(io, socket);

    socket.on('disconnect', () => {
        console.log(`Jugador desconectado: ${socket.data.user.username}`);
    });
});

/**
 * Inicialización de servicios y base de datos.
 */
const startServer = async () => {
    await connectDB();
    await syncModels();
    if (process.env.NODE_ENV === 'development') await runSeeder();
    server.listen(PORT, () => console.log(`SERVIDOR BOMBA-VA V1 ACTIVO EN PUERTO ${PORT}`));
};

startServer();