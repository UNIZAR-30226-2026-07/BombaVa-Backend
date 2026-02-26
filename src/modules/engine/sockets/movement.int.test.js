/**
 * Test de Integración: Movimiento por Sockets.
 * Valida que el servidor procese traslaciones y notifique a la sala.
 */
import { createServer } from 'http';
import { Server } from 'socket.io';
import { io as Client } from 'socket.io-client';
import { sequelize } from '../../../config/index.js';
import { createMatchWithInstance, socketProtect } from '../../../shared/index.js';
import { authService } from '../../auth/index.js';
import { registerGameHandlers } from '../../game/index.js';
import { registerEngineHandlers } from '../index.js';

describe('Engine Socket: Movement Responsibility', () => {
    let io, server, client, setup;
    const port = 4220;

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
            auth: { token: authService.generarTokenAcceso(setup.user) }
        });
        await new Promise(res => client.on('connect', res));
    });

    afterAll(async () => {
        if (client) client.disconnect();
        if (io) io.close();
        await new Promise(resolve => server.close(resolve));
        await sequelize.close();
    });

    it('Debe mover el barco y recibir la notificación de sala', async () => {
        const movePromise = new Promise((resolve, reject) => {
            client.once('ship:moved', (payload) => {
                try {
                    expect(payload.position.y).toBe(6);
                    resolve();
                } catch (e) {
                    reject(e);
                }
            });
            client.once('game:error', (err) => reject(new Error(err.message)));
        });

        client.emit('game:join', setup.match.id);

        client.once('game:joined', () => {
            client.emit('ship:move', {
                matchId: setup.match.id,
                shipId: setup.instance.id,
                direction: 'S'
            });
        });

        return movePromise;
    });
});