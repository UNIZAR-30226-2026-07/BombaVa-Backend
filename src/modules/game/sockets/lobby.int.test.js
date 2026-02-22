/**
 * Test de Integración: Lobby por Sockets (Game Module).
 * Valida la creación de salas mediante la fachada del módulo game.
 */
import { createServer } from 'http';
import { Server } from 'socket.io';
import { io as Client } from 'socket.io-client';
import { sequelize } from '../../../config/db.js';
import { socketProtect } from '../../../shared/middlewares/socketMiddleware.js';
import { createFullUserContext } from '../../../shared/models/testFactory.js';
import { generarTokenAcceso } from '../../auth/services/authService.js';
import { registerGameHandlers } from './index.js';

describe('Game Sockets: Lobby Integration', () => {
    let io, server, hSocket, gSocket, hCtx, gCtx;
    const port = 4061;

    beforeAll(async () => {
        await sequelize.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
        await sequelize.sync({ force: true });
        hCtx = await createFullUserContext('h', 'h@t.va');
        gCtx = await createFullUserContext('g', 'g@t.va');

        server = createServer();
        io = new Server(server);
        io.use(socketProtect);
        io.on('connection', (s) => registerGameHandlers(io, s));
        server.listen(port);

        hSocket = new Client(`http://localhost:${port}`, { auth: { token: generarTokenAcceso(hCtx.user) } });
        gSocket = new Client(`http://localhost:${port}`, { auth: { token: generarTokenAcceso(gCtx.user) } });
        await Promise.all([new Promise(r => hSocket.on('connect', r)), new Promise(r => gSocket.on('connect', r))]);
    });

    afterAll(() => {
        io.close();
        hSocket.close();
        gSocket.close();
        server.close();
    });

    it('Debe crear sala y notificar match:ready mediante la fachada game', (done) => {
        hSocket.emit('lobby:create', { userId: hCtx.user.id });
        hSocket.on('lobby:created', ({ codigo }) => {
            gSocket.emit('lobby:join', { codigo, userId: gCtx.user.id });
        });

        gSocket.on('match:ready', (data) => {
            expect(data.matchId).toBeDefined();
            done();
        });
    });
});