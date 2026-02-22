/**
 * Test de Integración: Movimiento por Sockets.
 * Valida que el servidor procese traslaciones y notifique a la sala.
 */
import { createServer } from 'http';
import { Server } from 'socket.io';
import { io as Client } from 'socket.io-client';
import { sequelize } from '../../../config/db.js';
import { generarTokenAcceso } from '../../../modules/auth/services/authService.js';
import { socketProtect } from '../../middlewares/socketMiddleware.js';
import { createMatchWithInstance } from '../../models/testFactory.js';
import { registerGameHandlers } from './index.js';

describe('Movement Socket Responsibility', () => {
    let io, server, client, setup;
    const port = 4030;

    beforeAll(async () => {
        await sequelize.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
        await sequelize.sync({ force: true });
        setup = await createMatchWithInstance('mover_test', 'm@t.va', { x: 5, y: 5 });

        server = createServer();
        io = new Server(server);
        io.use(socketProtect);
        io.on('connection', (s) => registerGameHandlers(io, s));
        server.listen(port);

        client = new Client(`http://localhost:${port}`, {
            auth: { token: generarTokenAcceso(setup.user) }
        });
        await new Promise(res => client.on('connect', res));
    });

    afterAll(() => {
        io.close();
        client.close();
        server.close();
    });

    it('Debe emitir ship:moved al recibir una dirección válida', (done) => {
        client.emit('game:join', setup.match.id);
        client.emit('ship:move', {
            matchId: setup.match.id,
            shipId: setup.instance.id,
            direction: 'S'
        });

        client.on('ship:moved', (payload) => {
            expect(payload.position.y).toBe(6);
            done();
        });
    });
});