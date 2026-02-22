import { createServer } from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import { connectDB } from './config/db.js';
import { syncModels } from './shared/models/index.js';
import runSeeder from './shared/models/seed.js';
import { registerGameHandlers } from './shared/sockets/gameHandler.js';
import { registerLobbyHandlers } from './shared/sockets/lobbyHandler.js';

const PORT = process.env.PORT || 3000;
const server = createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

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