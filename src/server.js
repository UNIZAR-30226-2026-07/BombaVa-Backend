/**
 * Main Entry Point
 * Inicializa Base de Datos, Servidor HTTP y WebSockets.
 */
import dotenv from 'dotenv';
import { createServer } from 'http';
import app from './app.js';
import { Server } from 'socket.io';
import { connectDB } from './config/db.js';
import { syncModels } from './shared/models/index.js';
import runSeeder from './shared/models/seed.js';


const PORT = process.env.PORT || 3000;
const server = createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*", // por ahora permitimos todo, luego lo cerraremos
    }
});

io.on('connection', (socket) => {
    console.log(`Jugador conectado con ID: ${socket.id}`);

    socket.on('disconnect', () => {
        console.log(`Jugador desconectado`);
    });
});

/**
 * Función de arranque del sistema
 */
const startServer = async () => {
    await connectDB();
    await syncModels();

    // para testing (mock datas)
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