/**
 * Test de Integración: Colocación de Minas por Sockets.
 * Valida la lógica de adyacencia y persistencia.
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

describe('Combat Socket: Mine Responsibility', () => {
    let io, server, client, setup;
    const port = 4150;

    beforeAll(async () => {
        await sequelize.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
        await sequelize.sync({ force: true });

        setup = await createCompleteMatch(
            { username: 'm1', email: 'm1@t.va' },
            { username: 'm2', email: 'm2@t.va' }
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
            auth: { token: generarTokenAcceso(setup.host.user) }
        });
        await new Promise(res => client.on('connect', res));
    });

    afterAll(async () => {
        client.disconnect();
        io.close();
        await new Promise(res => server.close(res));
        await sequelize.close();
    });

    it('Debe rechazar colocar mina si el objetivo no es adyacente', async () => {
        const errorPromise = new Promise((resolve) => {
            client.once('game:error', (err) => resolve(err.message));
        });

        client.emit('game:join', setup.match.id);

        client.emit('ship:attack:mine', {
            matchId: setup.match.id,
            shipId: setup.shipH.id,
            target: { x: 14, y: 14 }
        });

        const errMsg = await errorPromise;
        expect(errMsg).toContain('rango');
    });

    it('Debe permitir colocar mina en casilla adyacente', async () => {
        const launchPromise = new Promise((resolve, reject) => {
            client.once('projectile:launched', resolve);
            client.once('game:error', (err) => reject(new Error(err.message)));
        });

        client.emit('ship:attack:mine', {
            matchId: setup.match.id,
            shipId: setup.shipH.id,
            target: { x: 5, y: 6 }
        });

        await launchPromise;
        const mina = await Projectile.findOne({
            where: { matchId: setup.match.id, type: 'MINE', x: 5, y: 6 }
        });
        expect(mina).not.toBeNull();
    });
});