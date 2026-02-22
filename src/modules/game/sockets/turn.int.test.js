/**
 * Test de Integración: Gestión de Turnos por Sockets.
 * Valida el cambio de turno y la regeneración de recursos.
 */
import { createServer } from 'http';
import { Server } from 'socket.io';
import { io as Client } from 'socket.io-client';
import { sequelize } from '../../../config/db.js';
import { socketProtect } from '../../../shared/middlewares/socketMiddleware.js';
import { createCompleteMatch } from '../../../shared/models/testFactory.js';
import { registerGameHandlers } from '../../../shared/sockets/gameHandler/index.js';
import { generarTokenAcceso } from '../../auth/services/authService.js';

describe('Turn Socket Responsibility', () => {
    let io, server, client, setup;
    const port = 4031;

    beforeAll(async () => {
        await sequelize.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
        await sequelize.sync({ force: true });
        setup = await createCompleteMatch(
            { username: 'h', email: 'h@t.va' },
            { username: 'g', email: 'g@t.va' }
        );

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

    afterAll(() => {
        io.close();
        client.close();
        server.close();
    });

    it('Debe notificar el cambio de turno a la sala al finalizar', (done) => {
        client.emit('game:join', setup.match.id);
        client.emit('match:turn_end', { matchId: setup.match.id });

        client.on('match:turn_changed', (payload) => {
            expect(payload.turnNumber).toBe(2);
            expect(payload.nextPlayerId).toBe(setup.guest.user.id);
            done();
        });
    });

    it('Debe permitir la rendición y emitir el evento de fin de partida', (done) => {
        client.emit('match:surrender', { matchId: setup.match.id });

        client.on('match:finished', (payload) => {
            expect(payload.reason).toBe('surrender');
            done();
        });
    });
});