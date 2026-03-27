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

describe('Vision & Fog of War: Asymmetric Socket Responsibility', () => {
    let io, server, hostClient, guestClient, setup;
    const port = 4230; //Si cambiais el puerto y el test se rompe, cambiad el test

    beforeAll(async () => {
        await sequelize.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
        await sequelize.sync({ force: true });

        // Factoría: Host(NORTH) barco en {5,5}. Guest(SOUTH) barco en {5,7}.
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

    it('Debe emitir perspectivas independientes a cada jugador al moverse (V1 / V2 Readiness)', async () => {
        const hostPromise = new Promise(resolve => {
            hostClient.once('match:vision_update', (payload) => resolve(payload));
        });

        const guestPromise = new Promise(resolve => {
            guestClient.once('match:vision_update', (payload) => resolve(payload));
        });

        // El host mueve su barco al Sur. Pasa de {5,5} a {5,6}.
        hostClient.emit('ship:move', {
            matchId: setup.match.id,
            shipId: setup.shipH.id,
            direction: 'S'
        });

        const [hostVision, guestVision] = await Promise.all([hostPromise, guestPromise]);

        //EN   V2 ASEGURARSE QUE LO QUE VERIFICA ES CORRECTO (BARCOS SE VEN, ETC)
        // VALIDACIÓN HOST (NORTH)
        // El Host ve su barco donde lo movió ({5,6} mirando al 'N')
        expect(hostVision.myFleet[0].y).toBe(6);
        expect(hostVision.myFleet[0].orientation).toBe('N');
        // El Host ve al enemigo en coordenadas absolutas ({5,7} mirando al 'S')
        expect(hostVision.visibleEnemyFleet[0].y).toBe(7);
        expect(hostVision.visibleEnemyFleet[0].orientation).toBe('S');

        // VALIDACIÓN GUEST (SOUTH)
        // El Guest ve su barco en perspectiva local: Absoluto 7 -> 14 - 7 = 7. Orientación Absoluta 'S' -> 'N'
        expect(guestVision.myFleet[0].y).toBe(7);
        expect(guestVision.myFleet[0].orientation).toBe('N');
        // El Guest ve el barco enemigo en perspectiva local: Absoluto 6 -> 14 - 6 = 8. Orientación Absoluta 'N' -> 'S'
        expect(guestVision.visibleEnemyFleet[0].y).toBe(8);
        expect(guestVision.visibleEnemyFleet[0].orientation).toBe('S');
    });
});