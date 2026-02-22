/**
 * Test de Integración: Lobby Sockets
 * Valida el flujo completo de creación de sala y matchmaking.
 */
import { createServer } from 'http';
import { Server } from 'socket.io';
import { io as Client } from 'socket.io-client';
import { sequelize } from '../../config/db.js';
import { generarTokenAcceso } from '../../modules/auth/services/authService.js';
import { socketProtect } from '../middlewares/socketMiddleware.js';
import { createFullUserContext } from '../models/testFactory.js';
import { registerLobbyHandlers } from './lobbyHandler.js';

describe('LobbyHandler Socket Integration', () => {
    let io, server, hostSocket, guestSocket, hostCtx, guestCtx;
    const port = 4001;

    beforeAll(async () => {
        await sequelize.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
        await sequelize.sync({ force: true });

        hostCtx = await createFullUserContext('hoster', 'h@t.com');
        guestCtx = await createFullUserContext('guesty', 'g@t.com');

        server = createServer();
        io = new Server(server);
        io.use(socketProtect);

        io.on('connection', (socket) => {
            registerLobbyHandlers(io, socket);
        });

        server.listen(port);

        hostSocket = new Client(`http://localhost:${port}`, { auth: { token: generarTokenAcceso(hostCtx.user) } });
        guestSocket = new Client(`http://localhost:${port}`, { auth: { token: generarTokenAcceso(guestCtx.user) } });

        await Promise.all([
            new Promise(res => hostSocket.on('connect', res)),
            new Promise(res => guestSocket.on('connect', res))
        ]);
    });

    afterAll(() => {
        io.close();
        hostSocket.close();
        guestSocket.close();
        server.close();
    });

    it('Debe completar el flujo: Host crea sala -> Guest se une -> Partida lista', (done) => {
        hostSocket.emit('lobby:create', { userId: hostCtx.user.id });

        hostSocket.on('lobby:created', (data) => {
            const { codigo } = data;
            expect(codigo).toHaveLength(6);

            guestSocket.emit('lobby:join', { codigo, userId: guestCtx.user.id });
        });

        guestSocket.on('match:ready', (matchData) => {
            expect(matchData.matchId).toBeDefined();
            expect(matchData.status).toBe('PLAYING');
            done();
        });
    });
});