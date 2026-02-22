/**
 * Test de Integración: Gestión de Turnos por Sockets.
 * Valida el flujo de la partida mediante la fachada del módulo game.
 */
import { createServer } from 'http';
import { Server } from 'socket.io';
import { io as Client } from 'socket.io-client';
import { sequelize } from '../../../config/db.js';
import { socketProtect } from '../../../shared/middlewares/socketMiddleware.js';
import { createCompleteMatch } from '../../../shared/models/testFactory.js';
import { generarTokenAcceso } from '../../auth/services/authService.js';
import { registerGameHandlers } from './index.js'; // Ruta corregida

describe('Turn Socket Responsibility', () => {
    let io, server, client, setup;
    const port = 4070;

    beforeAll(async () => {
        await sequelize.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
        await sequelize.sync({ force: true });
        setup = await createCompleteMatch({ username: 'h', email: 'h@t.va' }, { username: 'g', email: 'g@t.va' });

        server = createServer();
        io = new Server(server);
        io.use(socketProtect);
        io.on('connection', (s) => registerGameHandlers(io, s));
        server.listen(port);

        client = new Client(`http://localhost:${port}`, {
            auth: { token: generarTokenAcceso(setup.host.user) }
        });
        await new Promise(res => client.on('connect', res));
    });

    afterAll(async () => {
        io.close();
        client.close();
        await new Promise(resolve => server.close(resolve));
        await sequelize.close();
    });

    it('Debe notificar el cambio de turno a la sala', (done) => {
        client.emit('game:join', setup.match.id);

        client.emit('match:turn_end', { matchId: setup.match.id });

        client.on('match:turn_changed', (payload) => {
            expect(payload.turnNumber).toBe(2);
            done();
        });
    });
});