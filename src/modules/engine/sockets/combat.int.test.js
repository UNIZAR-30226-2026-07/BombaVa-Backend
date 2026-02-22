/**
 * Test de Integración: Combate por Sockets (Engine Module).
 * Valida el flujo de daño mediante la fachada del módulo engine.
 */
import { createServer } from 'http';
import { Server } from 'socket.io';
import { io as Client } from 'socket.io-client';
import { sequelize } from '../../../config/db.js';
import { socketProtect } from '../../../shared/middlewares/socketMiddleware.js';
import { createCompleteMatch } from '../../../shared/models/testFactory.js';
import { generarTokenAcceso } from '../../auth/services/authService.js';
import { registerEngineHandlers } from './index.js';

describe('Engine Sockets: Combat Integration', () => {
    let io, server, client, setup;
    const port = 4060;

    beforeAll(async () => {
        await sequelize.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
        await sequelize.sync({ force: true });
        setup = await createCompleteMatch({ username: 'at', email: 'a@t.va' }, { username: 'vi', email: 'v@t.va' });

        server = createServer();
        io = new Server(server);
        io.use(socketProtect);
        io.on('connection', (s) => registerEngineHandlers(io, s));
        server.listen(port);

        client = new Client(`http://localhost:${port}`, {
            auth: { token: generarTokenAcceso(setup.host.user) }
        });
        await new Promise(res => client.on('connect', res));
    });

    afterAll(() => {
        io.close();
        client.close();
        server.close();
    });

    it('Debe procesar el disparo y emitir ship:attacked a través de la fachada engine', (done) => {
        client.emit('ship:attack:cannon', {
            matchId: setup.match.id,
            shipId: setup.host.uShip.id,
            target: { x: 0, y: 14 }
        });

        client.on('ship:attacked', (payload) => {
            expect(payload.hit).toBe(true);
            done();
        });
    });
});