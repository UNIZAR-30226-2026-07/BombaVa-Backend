/**
 * Test de Integración: Movimiento por Sockets
 */
import { createServer } from 'http';
import { Server } from 'socket.io';
import { io as Client } from 'socket.io-client';
import { sequelize } from '../../../config/db.js';
import { socketProtect } from '../../../shared/middlewares/socketMiddleware.js';
import { createMatchWithInstance } from '../../../shared/models/testFactory.js';
import { generarTokenAcceso } from '../../auth/services/authService.js';
import { registerGameHandlers } from '../../game/sockets/index.js';
import { registerEngineHandlers } from './index.js';

describe('Engine Socket: Movement Responsibility', () => {
    let io, server, client, setup;
    const port = 4071;

    beforeAll(async () => {
        await sequelize.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
        await sequelize.sync({ force: true });
        setup = await createMatchWithInstance('engine_mover', 'em@t.va', { x: 5, y: 5 });

        server = createServer();
        io = new Server(server);
        io.use(socketProtect);

        io.on('connection', (s) => {
            registerGameHandlers(io, s);
            registerEngineHandlers(io, s);
        });
        server.listen(port);

        client = new Client(`http://localhost:${port}`, {
            auth: { token: generarTokenAcceso(setup.user) }
        });
        await new Promise(res => client.on('connect', res));
    });

    afterAll(async () => {
        io.close();
        client.close();
        await new Promise(resolve => server.close(resolve));
        await sequelize.close();
    });

    it('Debe mover el barco y recibir la notificación de sala', (done) => {
        client.emit('game:join', setup.match.id);

        setTimeout(() => {
            client.emit('ship:move', {
                matchId: setup.match.id,
                shipId: setup.instance.id,
                direction: 'S'
            });
        }, 50);

        client.on('ship:moved', (payload) => {
            expect(payload.position.y).toBe(6);
            done();
        });
    });
});