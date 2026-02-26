/**
 * Test de Integración: Ataque de Cañón por Sockets.
 * Valida el flujo de daño mediante la fachada del módulo engine.
 */
import { createServer } from 'http';
import { Server } from 'socket.io';
import { io as Client } from 'socket.io-client';
import { sequelize } from '../../../../config/index.js';
import { createCompleteMatch, socketProtect } from '../../../../shared/index.js';
import { authService } from '../../../auth/index.js';
import { registerGameHandlers } from '../../../game/index.js';
import { registerEngineHandlers } from '../index.js';

describe('Combat Socket: Cannon Responsibility', () => {
    let io, server, client, setup;
    const port = 4180;

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
        io.on('connection', (s) => {
            registerGameHandlers(io, s);
            registerEngineHandlers(io, s);
        });
        server.listen(port);

        client = new Client(`http://localhost:${port}`, {
            auth: { token: authService.generarTokenAcceso(setup.host.user) }
        });
        await new Promise(res => client.on('connect', res));
    });

    afterAll(async () => {
        if (client) client.disconnect();
        if (io) io.close();
        await new Promise(res => server.close(res));
        await sequelize.close();
    });

    it('Debe procesar el disparo y notificar el impacto a la sala', async () => {
        const attackPromise = new Promise((resolve, reject) => {
            client.once('ship:attacked', (payload) => {
                if (payload.hit) resolve(payload);
                else reject(new Error('El ataque debió impactar al objetivo'));
            });
            client.once('game:error', (err) => reject(new Error(err.message)));
        });

        client.emit('game:join', setup.match.id);

        client.once('game:joined', () => {
            client.emit('ship:attack:cannon', {
                matchId: setup.match.id,
                shipId: setup.shipH.id,
                target: { x: setup.shipG.x, y: setup.shipG.y }
            });
        });

        return attackPromise;
    });
});