/**
 * Test de Integración: Movimiento por Sockets (Módulo Engine).
 */
import { createServer } from 'http';
import { Server } from 'socket.io';
import { io as Client } from 'socket.io-client';
import { sequelize } from '../../../config/db.js';
import { socketProtect } from '../../../shared/middlewares/socketMiddleware.js';
import { createMatchWithInstance } from '../../../shared/models/testFactory.js';
import { generarTokenAcceso } from '../../auth/services/authService.js';
import { registerEngineHandlers } from './index.js';

describe('Engine Socket: Movement Responsibility', () => {
    let io, server, client, setup;
    const port = 4050;

    beforeAll(async () => {
        await sequelize.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
        await sequelize.sync({ force: true });
        setup = await createMatchWithInstance('engine_mover', 'em@t.va', { x: 5, y: 5 });

        server = createServer();
        io = new Server(server);
        io.use(socketProtect);

        // Solo registramos los eventos del módulo que estamos testeando
        io.on('connection', (s) => registerEngineHandlers(io, s));
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

    it('Debe mover el barco mediante el evento de socket del módulo engine', (done) => {
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