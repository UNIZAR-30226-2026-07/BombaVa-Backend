/**
 * Test de Integración: Lanzamiento de Torpedo por Sockets.
 */
import { createServer } from 'http';
import { Server } from 'socket.io';
import { io as Client } from 'socket.io-client';
import { sequelize } from '../../../../config/db.js';
import { socketProtect } from '../../../../shared/middlewares/socketMiddleware.js';
import { Projectile } from '../../../../shared/models/index.js';
import { createCompleteMatch } from '../../../../shared/models/testFactory.js';
import { generarTokenAcceso } from '../../../auth/services/authService.js';
import { registerGameHandlers } from '../../../game/sockets/index.js';
import { registerEngineHandlers } from '../index.js';

describe('Combat Socket: Torpedo Responsibility', () => {
    let io, server, client, setup;
    const port = 4131;

    beforeAll(async () => {
        await sequelize.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
        await sequelize.sync({ force: true });
        setup = await createCompleteMatch({ username: 't1', email: 't1@t.va' }, { username: 't2', email: 't2@t.va' });

        server = createServer();
        io = new Server(server);
        io.use(socketProtect);
        io.on('connection', (s) => {
            registerGameHandlers(io, s);
            registerEngineHandlers(io, s);
        });
        server.listen(port);

        client = new Client(`http://localhost:${port}`, { auth: { token: generarTokenAcceso(setup.host.user) } });
        await new Promise(res => client.on('connect', res));
    });

    afterAll(async () => {
        io.close();
        client.close();
        await new Promise(res => server.close(res));
        await sequelize.close();
    });

    it('Debe crear un proyectil dinámico en DB al lanzar torpedo', async () => {
        const launchPromise = new Promise((resolve, reject) => {
            client.on('projectile:launched', resolve);
            client.on('game:error', (err) => reject(new Error(err.message)));
        });

        client.on('game:joined', () => {
            client.emit('ship:attack:torpedo', {
                matchId: setup.match.id,
                shipId: setup.shipH.id
            });
        });

        client.emit('game:join', setup.match.id);
        await launchPromise;
        const torpedo = await Projectile.findOne({ where: { matchId: setup.match.id, type: 'TORPEDO' } });
        expect(torpedo).not.toBeNull();
    });
});