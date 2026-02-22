/**
 * Test de Integración: Combate por Sockets.
 * Valida el flujo de ataque y daño entre dos jugadores reales.
 */
import { createServer } from 'http';
import { Server } from 'socket.io';
import { io as Client } from 'socket.io-client';
import { sequelize } from '../../../config/db.js';
import { generarTokenAcceso } from '../../../modules/auth/services/authService.js';
import { socketProtect } from '../../middlewares/socketMiddleware.js';
import { createCompleteMatch } from '../../models/testFactory.js';
import { registerGameHandlers } from './index.js';

describe('Combat Socket Integration (Facade)', () => {
    let io, server, attackerSocket, setup;
    const port = 4020;

    beforeAll(async () => {
        await sequelize.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
        await sequelize.sync({ force: true });

        // Escenario: Host ataca a Guest
        setup = await createCompleteMatch(
            { username: 'atancante', email: 'a@t.com' },
            { username: 'victima', email: 'v@t.com' }
        );

        server = createServer();
        io = new Server(server);
        io.use(socketProtect);
        io.on('connection', (s) => registerGameHandlers(io, s));
        server.listen(port);

        attackerSocket = new Client(`http://localhost:${port}`, {
            auth: { token: generarTokenAcceso(setup.host.user) }
        });

        await new Promise(res => attackerSocket.on('connect', res));
    });

    afterAll(() => {
        io.close();
        attackerSocket.close();
        server.close();
    });

    it('Debe procesar un impacto de cañón y notificar a la sala con el nuevo HP', (done) => {
        attackerSocket.emit('game:join', setup.match.id);

        // Host ataca a la posición inicial del Guest (0, 14)
        attackerSocket.emit('ship:attack:cannon', {
            matchId: setup.match.id,
            shipId: setup.host.uShip.id, // Simplificado vía factory
            target: { x: 0, y: 14 }
        });

        attackerSocket.on('ship:attacked', (payload) => {
            expect(payload.hit).toBe(true);
            expect(payload.targetHp).toBeLessThan(setup.guest.template.baseMaxHp);
            expect(payload.ammoCurrent).toBeLessThan(5);
            done();
        });
    });
});