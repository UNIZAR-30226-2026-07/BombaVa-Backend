/**
 * Test de Integración: Niebla de Guerra y Emisión Asimétrica.
 */
import { createServer } from 'http';
import { Server } from 'socket.io';
import { io as Client } from 'socket.io-client';
import { sequelize } from '../../../config/index.js';
import { createCompleteMatch, socketProtect } from '../../../shared/index.js';
import { authService } from '../../auth/index.js';
import { registerGameHandlers } from '../../game/index.js';
import { registerEngineHandlers } from '../index.js';

describe('Vision & Fog of War: Asymmetric Socket Responsibility', () => {
    let io, server, hostClient, guestClient, setup;
    const port = 4238; 

    beforeAll(async () => {
        await sequelize.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
        await sequelize.sync({ force: true });

        setup = await createCompleteMatch(
            { username: 'v_host', email: 'vh@test.com' },
            { username: 'v_guest', email: 'vg@test.com' }
        );

        server = createServer();
        io = new Server(server);
        io.use(socketProtect);
        io.on('connection', (s) => {
            registerGameHandlers(io, s);
            registerEngineHandlers(io, s);
        });
        server.listen(port);

        hostClient = new Client(`http://localhost:${port}`, {
            auth: { token: authService.generarTokenAcceso(setup.host.user) }
        });
        guestClient = new Client(`http://localhost:${port}`, {
            auth: { token: authService.generarTokenAcceso(setup.guest.user) }
        });

        await Promise.all([
            new Promise(res => hostClient.on('connect', res)),
            new Promise(res => guestClient.on('connect', res))
        ]);
    }, 20000);

    afterAll(async () => {
        hostClient.disconnect();
        guestClient.disconnect();
        io.close();
        await new Promise(res => server.close(res));
        await sequelize.close();
    });

    it('Debe emitir perspectivas independientes a cada jugador al moverse', (done) => {
        let updatesReceived = 0;
        let hostPayload = null;
        let guestPayload = null;

        // Configuramos la escucha antes de mover
        hostClient.on('match:vision_update', (payload) => {
            hostPayload = payload;
            updatesReceived++;
            if (updatesReceived === 2) validate();
        });

        guestClient.on('match:vision_update', (payload) => {
            guestPayload = payload;
            updatesReceived++;
            if (updatesReceived === 2) validate();
        });

        const validate = () => {
            try {
                // Host ve su barco movido a Y=6 absoluto
                expect(hostPayload.myFleet[0].y).toBe(6);
                // Guest ve su barco en Y=7 local (Y=7 absoluto)
                expect(guestPayload.myFleet[0].y).toBe(7);
                // Guest ve al enemigo en Y=8 local (Y=6 absoluto -> 14-6=8)
                expect(guestPayload.visibleEnemyFleet[0].y).toBe(8);
                done();
            } catch (e) {
                done(e);
            }
        };

        hostClient.emit('game:join', setup.match.id);
        guestClient.emit('game:join', setup.match.id);

        let joinedCount = 0;
        const onJoined = () => {
            joinedCount++;
            if (joinedCount === 2) {
                setTimeout(() => {
                    hostClient.emit('ship:move', {
                        matchId: setup.match.id,
                        shipId: setup.shipH.id,
                        direction: 'S'
                    });
                }, 100);
            }
        };

        hostClient.once('game:joined', onJoined);
        guestClient.once('game:joined', onJoined);
        
    }, 20000);
});