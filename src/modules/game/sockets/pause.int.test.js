/**
 * Test de Integración: Gestión de Pausas por Consenso.
 * Valida los RF-501 y RF-502.
 */
import { createServer } from 'http';
import { Server } from 'socket.io';
import { io as Client } from 'socket.io-client';
import { sequelize } from '../../../config/index.js';
import { createCompleteMatch, socketProtect } from '../../../shared/index.js';
import { authService } from '../../auth/index.js';
import { registerGameHandlers } from './index.js';
import MatchDao from '../dao/MatchDao.js';

afterAll(async () => {
    // Desconectar cli
    if (hostClient) hostClient.disconnect();
    if (guestClient) guestClient.disconnect();
    
    // Limpiar los timers de 2 minutos que se quedaron colgando
    clearGameTimers();

    // Cerrar el servidor de sockets
    if (io) io.close();
    
    // esperar
    await new Promise(resolve => setTimeout(resolve, 500));

    // cerrar la bd
    await new Promise(res => server.close(res));
    await sequelize.close();
});

describe('Game Sockets: Pause Responsibility', () => {
    let io, server, hostClient, guestClient, setup;
    const port = 4250;

    beforeAll(async () => {
        await sequelize.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
        await sequelize.sync({ force: true });

        setup = await createCompleteMatch(
            { username: 'pauser_host', email: 'ph@t.va' },
            { username: 'pauser_guest', email: 'pg@t.va' }
        );

        server = createServer();
        io = new Server(server);
        io.use(socketProtect);
        io.on('connection', (s) => registerGameHandlers(io, s));
        server.listen(port);

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

        hostClient.emit('game:join', setup.match.id);
        guestClient.emit('game:join', setup.match.id);

        await Promise.all([
            new Promise(r => hostClient.once('game:joined', r)),
            new Promise(r => guestClient.once('game:joined', r))
        ]);
    });

    afterAll(async () => {
        hostClient.disconnect();
        guestClient.disconnect();
        io.close();
        await new Promise(res => server.close(res));
        await sequelize.close();
    });

    it('Debe impedir que el solicitante acepte su propia petición de pausa', (done) => {
        hostClient.once('game:error', (err) => {
            expect(err.message).toContain('No puedes aceptar tu propia solicitud');
            done();
        });

        hostClient.emit('match:pause_request', { matchId: setup.match.id });
        
        // El mismo cliente intenta aceptarla
        setTimeout(() => {
            hostClient.emit('match:pause_accept', { matchId: setup.match.id });
        }, 50);
    });

    it('Debe notificar al solicitante si el oponente rechaza la pausa', (done) => {
        hostClient.once('match:pause_rejected', (data) => {
            expect(data.message).toContain('ha rechazado');
            done();
        });

        hostClient.emit('match:pause_request', { matchId: setup.match.id });
        
        setTimeout(() => {
            guestClient.emit('match:pause_reject', { matchId: setup.match.id });
        }, 50);
    });

    it('Debe pausar la partida (estado WAITING) cuando el oponente acepta', async () => {
        const pausePromise = new Promise(resolve => {
            hostClient.once('match:paused', resolve);
        });

        hostClient.emit('match:pause_request', { matchId: setup.match.id });
        
        setTimeout(() => {
            guestClient.emit('match:pause_accept', { matchId: setup.match.id });
        }, 50);

        await pausePromise;

        // Validamos en Base de Datos
        const partida = await MatchDao.findById(setup.match.id);
        expect(partida.status).toBe('WAITING');
    });
});
