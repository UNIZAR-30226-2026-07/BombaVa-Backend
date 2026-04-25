/**
 * Test de Integración: Gestión de Desconexiones y Reconexión Automática.
 * Valida los RF-505 y RF-506.
 */
import { createServer } from 'http';
import { Server } from 'socket.io';
import { io as Client } from 'socket.io-client';
import { sequelize } from '../../../config/index.js';
import { createCompleteMatch, socketProtect } from '../../../shared/index.js';
import { authService } from '../../auth/index.js';
import { registerGameHandlers, clearGameTimers } from './index.js';
import { registerEngineHandlers } from '../../engine/index.js';


describe('Game Sockets: Disconnect & Reconnect Responsibility', () => {
    let io, server, hostClient, guestClient, setup;
    const port = 4260;

    beforeAll(async () => {
        await sequelize.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
        await sequelize.sync({ force: true });

        // Creamos una partida que ya estará en estado PLAYING en BBDD
        setup = await createCompleteMatch(
            { username: 'host_disc', email: 'hd@t.va' },
            { username: 'guest_disc', email: 'gd@t.va' }
        );

        server = createServer();
        io = new Server(server);
        io.use(socketProtect);
        
        // Registramos los handlers
        io.on('connection', (s) => {
            registerGameHandlers(io, s);
            registerEngineHandlers(io, s);
        });
        
        server.listen(port);

        // Conectamos a los clientes
        hostClient = new Client(`http://localhost:${port}`, {
            auth: { token: authService.generarTokenAcceso(setup.host.user) }
        });
        guestClient = new Client(`http://localhost:${port}`, {
            auth: { token: authService.generarTokenAcceso(setup.guest.user) }
        });

        await Promise.all([
            new Promise(r => hostClient.on('connect', r)),
            new Promise(r => guestClient.on('connect', r))
        ]);
        
        // Los metemos en la sala
        hostClient.emit('game:join', setup.match.id);
        guestClient.emit('game:join', setup.match.id);

        await Promise.all([
            new Promise(r => hostClient.once('game:joined', r)),
            new Promise(r => guestClient.once('game:joined', r))
        ]);
    });

   afterAll(async () => {
        if (hostClient) hostClient.disconnect();
        if (guestClient) guestClient.disconnect();   
        // evitar Open Handles
        clearGameTimers();
        if (io) io.close();
        await new Promise(resolve => setTimeout(resolve, 500));
        if (server) await new Promise(res => server.close(res));
        await sequelize.close();
    });

    it('RF-506: Debe devolver la partida activa al preguntar (game:check_active)', (done) => {
        hostClient.once('game:active_found', (payload) => {
            expect(payload.matchId).toBe(setup.match.id);
            done();
        });

        hostClient.emit('game:check_active');
    });

    it('RF-505: Debe notificar a la sala cuando un jugador pierde la conexión', (done) => {
        hostClient.once('match:player_disconnected', (payload) => {
            expect(payload.message).toContain('perdido la conexión');
            expect(payload.userId).toBe(setup.guest.user.id);
            done();
        });

        // Simulamos que el guest tira del cable
        guestClient.disconnect();
    });

    it('RF-506: Debe restaurar el estado y cancelar el aviso al reconectarse a la sala', async () => {
        // Conectamos de nuevo al guest
        guestClient.connect();
        await new Promise(r => guestClient.once('connect', r));

        const reconnectNoticePromise = new Promise(resolve => {
            // El host debe ser avisado de que el guest volvió
            hostClient.once('match:player_reconnected', (payload) => {
                expect(payload.message).toContain('reconectado');
                resolve();
            });
        });

        const startInfoPromise = new Promise(resolve => {
            // El guest debe recibir el snapshot de la partida
            guestClient.once('match:startInfo', (payload) => {
                expect(payload.matchInfo.matchId).toBe(setup.match.id);
                expect(payload.playerFleet).toBeDefined();
                resolve();
            });
        });

        // El frontend del guest, al encontrar la partida activa, emite un join
        guestClient.emit('game:join', setup.match.id);

        await Promise.all([reconnectNoticePromise, startInfoPromise]);
    });
});
