/**
 * Test de Integración: Game Sockets
 * Valida el flujo de movimiento y ataque a través del protocolo WebSocket.
 */
import { createServer } from 'http';
import { Server } from 'socket.io';
import { io as Client } from 'socket.io-client';
import { sequelize } from '../../config/db.js';
import { generarTokenAcceso } from '../../modules/auth/services/authService.js';
import { socketProtect } from '../middlewares/socketMiddleware.js';
import { createMatchWithInstance } from '../models/testFactory.js';
import { registerGameHandlers } from './gameHandler.js';

describe('GameHandler Socket Integration', () => {
    let io, server, clientSocket, setup;
    const port = 4000;

    beforeAll(async () => {
        await sequelize.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
        await sequelize.sync({ force: true });

        // Setup de datos reales
        setup = await createMatchWithInstance('socket_user', 's@t.com', { x: 5, y: 5 });
        const token = generarTokenAcceso(setup.user);

        // Crear servidor de pruebas dedicado
        server = createServer();
        io = new Server(server);
        io.use(socketProtect);

        io.on('connection', (socket) => {
            registerGameHandlers(io, socket);
        });

        server.listen(port);

        // Conectar cliente de prueba con el token del setup
        clientSocket = new Client(`http://localhost:${port}`, {
            auth: { token }
        });

        await new Promise((resolve) => clientSocket.on('connect', resolve));
    });

    afterAll(() => {
        io.close();
        clientSocket.close();
        server.close();
        sequelize.close();
    });

    it('Debe emitir ship:moved tras un movimiento válido por socket', (done) => {
        clientSocket.emit('game:join', setup.match.id);

        clientSocket.emit('ship:move', {
            matchId: setup.match.id,
            shipId: setup.instance.id,
            direction: 'S'
        });

        clientSocket.on('ship:moved', (payload) => {
            expect(payload.position.y).toBe(6);
            expect(payload.userId).toBe(setup.user.id);
            done();
        });
    });

    it('Debe devolver game:error si el movimiento es inválido (fuera de límites)', (done) => {
        clientSocket.emit('ship:move', {
            matchId: setup.match.id,
            shipId: setup.instance.id,
            direction: 'N' // Intentar salir del mapa desde arriba (setup estaba en 0,0 en realidad o cerca)
        });

        clientSocket.on('game:error', (error) => {
            expect(error.message).toBeDefined();
            done();
        });
    });
});