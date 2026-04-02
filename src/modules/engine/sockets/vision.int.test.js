/**
 * Test de Integración: Niebla de Guerra y Emisión Asimétrica.
 * Garantiza que red manda perspectivas diferentes a cada jugador, 
 * preparándolo para la V2 (filtrado estricto).
 */
import { createServer } from 'http';
import { Server } from 'socket.io';
import { io as Client } from 'socket.io-client';
import { sequelize } from '../../../config/index.js';          
import { createCompleteMatch, socketProtect } from '../../../shared/index.js'; 
import { authService } from '../../auth/index.js';              
import { registerGameHandlers } from '../../game/index.js';  
import { registerEngineHandlers } from '../index.js';  

describe('Vision y niebla de guerra', () => {
    let io, server, hostClient, guestClient, setup;
    const port = 4230;

    beforeAll(async () => {
        await sequelize.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
        await sequelize.sync({ force: true });

        setup = await createCompleteMatch(
            { username: 'vision_host', email: 'vh@t.va' },
            { username: 'vision_guest', email: 'vg@t.va' }
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

        // Unimos a ambos a la sala de la partida
        hostClient.emit('game:join', setup.match.id);
        guestClient.emit('game:join', setup.match.id);

        await Promise.all([
            new Promise(res => hostClient.once('game:joined', res)),
            new Promise(res => guestClient.once('game:joined', res))
        ]);
    });

    afterAll(async () => {
        hostClient.disconnect();
        guestClient.disconnect();
        io.close();
        await new Promise(res => server.close(res));
        await sequelize.close();
    });

    it('Debe emitir perspectivas independientes a cada jugador al moverse', async () => {
        const hostPromise = new Promise(resolve => {
            hostClient.once('match:vision_update', (payload) => resolve(payload));
        });

        const guestPromise = new Promise(resolve => {
            guestClient.once('match:vision_update', (payload) => resolve(payload));
        });

        hostClient.emit('ship:move', {
            matchId: setup.match.id,
            shipId: setup.shipH.id,
            direction: 'S'
        });

        const [hostVision, guestVision] = await Promise.all([hostPromise, guestPromise]);
        expect(hostVision.myFleet[0].y).toBe(4);
        expect(hostVision.myFleet[0].orientation).toBe('N');
        // El Host ve al enemigo en coordenadas absolutas ({5,7} mirando al 'S')
        expect(hostVision.visibleEnemyFleet[0].y).toBe(7);
        expect(hostVision.visibleEnemyFleet[0].orientation).toBe('S');

        // El Guest ve su barco en perspectiva local.
        expect(guestVision.myFleet[0].y).toBe(7);
        expect(guestVision.myFleet[0].orientation).toBe('N');
        // El Guest ve el barco enemigo en perspectiva local.
        expect(guestVision.visibleEnemyFleet[0].y).toBe(10);
        expect(guestVision.visibleEnemyFleet[0].orientation).toBe('S');
    });
});