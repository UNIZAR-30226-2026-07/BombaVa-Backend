/**
 * Test de Integración: Lobby por Sockets.
 * Valida el matchmaking usando la identidad vinculada al socket.
 */
import { createServer } from 'http';
import { Server } from 'socket.io';
import { io as Client } from 'socket.io-client';
import { sequelize } from '../../../config/index.js';
import { createFullUserContext, socketProtect } from '../../../shared/index.js';
import { authService } from '../../auth/index.js';
import { registerGameHandlers } from '../index.js';

describe('Game Sockets: Lobby Identity Refactor', () => {
    let io, server, hSocket, gSocket, hCtx, gCtx;
    const port = 4210;

    beforeAll(async () => {
        await sequelize.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
        await sequelize.sync({ force: true });

        hCtx = await createFullUserContext('hoster', 'h@t.va');
        gCtx = await createFullUserContext('guesty', 'g@t.va');

        server = createServer();
        io = new Server(server);
        io.use(socketProtect);
        io.on('connection', (s) => registerGameHandlers(io, s));
        server.listen(port);

        hSocket = new Client(`http://localhost:${port}`, {
            auth: { token: authService.generarTokenAcceso(hCtx.user) }
        });
        gSocket = new Client(`http://localhost:${port}`, {
            auth: { token: authService.generarTokenAcceso(gCtx.user) }
        });

        await Promise.all([
            new Promise(r => hSocket.on('connect', r)),
            new Promise(r => gSocket.on('connect', r))
        ]);
    });

    afterAll(async () => {
        if (hSocket) hSocket.disconnect();
        if (gSocket) gSocket.disconnect();
        if (io) io.close();
        await new Promise(res => server.close(res));
        await sequelize.close();
    });

    it('Debe crear y unirse a sala usando la identidad del socket', (done) => {
        hSocket.emit('lobby:create');

        hSocket.once('lobby:created', ({ codigo }) => {
            expect(codigo).toBeDefined();
            gSocket.emit('lobby:join', { codigo });
        });

        gSocket.once('match:ready', (data) => {
            expect(data.matchId).toBeDefined();
            done();
        });

        gSocket.once('lobby:error', (err) => done(new Error(err.message)));
    });
});