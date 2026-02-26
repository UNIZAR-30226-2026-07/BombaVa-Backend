/**
 * Test de Integración: Gestión de Turnos por Sockets.
 */
import { createServer } from 'http';
import { Server } from 'socket.io';
import { io as Client } from 'socket.io-client';
import { sequelize } from '../../../config/index.js';
import { createCompleteMatch, socketProtect } from '../../../shared/index.js';
import { authService } from '../../auth/index.js';
import { registerGameHandlers } from './index.js';

describe('Turn Socket Responsibility', () => {
    let io, server, client, setup;
    const port = 4070;

    beforeAll(async () => {
        await sequelize.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
        await sequelize.sync({ force: true });

        setup = await createCompleteMatch(
            { username: 'host', email: 'h@t.va' },
            { username: 'guest', email: 'g@t.va' }
        );

        server = createServer();
        io = new Server(server);
        io.use(socketProtect);
        io.on('connection', (s) => registerGameHandlers(io, s));
        server.listen(port);

        client = new Client(`http://localhost:${port}`, {
            auth: { token: authService.generarTokenAcceso(setup.host.user) }
        });
        await new Promise(res => client.on('connect', res));
    });

    afterAll(async () => {
        if (client) client.disconnect();
        if (io) io.close();
        await new Promise(resolve => server.close(resolve));
        await sequelize.close();
    });

    it('Debe notificar el cambio de turno a la sala', (done) => {
        client.emit('game:join', setup.match.id);

        client.once('game:joined', () => {
            client.emit('match:turn_end', { matchId: setup.match.id });
        });

        client.on('match:turn_changed', (payload) => {
            expect(payload.turnNumber).toBe(2);
            done();
        });
    });
});