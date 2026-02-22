/**
 * Test de Integración: Combate por Sockets (Módulo Engine).
 * Valida el flujo de daño mediante la fachada del módulo engine.
 */
import { createServer } from 'http';
import { Server } from 'socket.io';
import { io as Client } from 'socket.io-client';
import { sequelize } from '../../../config/db.js';
import { socketProtect } from '../../../shared/middlewares/socketMiddleware.js';
import { createCompleteMatch } from '../../../shared/models/testFactory.js';
import { generarTokenAcceso } from '../../auth/services/authService.js';
import { registerGameHandlers } from '../../game/sockets/index.js';
import { registerEngineHandlers } from './index.js';

describe('Engine Sockets: Combat Integration', () => {
    let io, server, client, setup;
    const port = 4090;

    beforeAll(async () => {
        await sequelize.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
        await sequelize.sync({ force: true });

        setup = await createCompleteMatch(
            { username: 'atancante', email: 'a@t.va' },
            { username: 'victima', email: 'v@t.va' }
        );

        server = createServer();
        io = new Server(server);
        io.use(socketProtect);

        io.on('connection', (socket) => {
            registerGameHandlers(io, socket);
            registerEngineHandlers(io, socket);
        });

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

    it('Debe procesar el disparo y notificar el impacto a la sala', (done) => {
        client.on('game:error', (err) => {
            done(new Error(`Error del servidor: ${err.message}`));
        });

        client.on('ship:attacked', (payload) => {
            try {
                expect(payload.hit).toBe(true);
                expect(payload.targetHp).toBeLessThan(setup.guest.template.baseMaxHp);
                done();
            } catch (error) {
                done(error);
            }
        });

        client.on('game:joined', () => {
            client.emit('ship:attack:cannon', {
                matchId: setup.match.id,
                shipId: setup.host.uShip.id,
                target: { x: 0, y: 14 }
            });
        });

        client.emit('game:join', setup.match.id);
    });
});