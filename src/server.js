/**
 * Main Entry Point
 * Inicializa Base de Datos, Servidor HTTP y WebSockets.
 */
require('dotenv').config();
const http = require('http');
const app = require('./app');
const { Server } = require('socket.io');
const { connectDB } = require('./config/db');


const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

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

    server.listen(PORT, () => {
        console.log('---------------------------------------------');
        console.log(`SERVIDOR BOMBA-VA`);
        console.log(`URL: http://localhost:${PORT}`);
        console.log('---------------------------------------------');
    });
};

startServer();