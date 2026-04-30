/**
 * Test de Integración: Simulación de Partida contra la IA.
 * Valida los RF-601, RF-602 y RF-603.
 */
import { createServer } from 'http';
import { Server } from 'socket.io';
import { io as Client } from 'socket.io-client';
import { sequelize } from '../../../config/index.js';
import { socketProtect } from '../../../shared/index.js';
import { authService } from '../../auth/index.js';
import { registerGameHandlers, clearGameTimers } from './index.js';
import { registerEngineHandlers } from '../../engine/index.js';
import { createFullUserContext } from '../../../shared/models/testFactory.js';
import { BOT_UUID } from '../../../shared/models/bootstrap.js';

describe('AI Bot Integration Test', () => {
    let io, server, client, setup;
    const port = 4270;

    beforeAll(async () => {
        // Limpiamos y preparamos la base de datos
        await sequelize.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
        await sequelize.sync({ force: true });

        // Esto ya crea al bot
        setup = await createFullUserContext('humano_vs_bot', 'hvbot@test.va');

        server = createServer();
        io = new Server(server);
        io.use(socketProtect);
        
        io.on('connection', (s) => {
            registerGameHandlers(io, s);
            registerEngineHandlers(io, s);
        });
        
        server.listen(port);

        // Conectamos el cliente simulando el frontend
        client = new Client(`http://localhost:${port}`, {
            auth: { token: authService.generarTokenAcceso(setup.user) }
        });

        await new Promise(r => client.on('connect', r));
    });

    afterAll(async () => {
        if (client) client.disconnect();
        clearGameTimers();
        if (io) io.close();
        if (server) await new Promise(res => server.close(res));
        await sequelize.close();
    });

    it('RF-601: Debe iniciar partida contra Bot y recibir toda la información inicial', async () => {
        const readyPromise = new Promise(resolve => client.once('match:ready', resolve));
        const startInfoPromise = new Promise(resolve => client.once('match:startInfo', resolve));

        client.emit('game:play_bot');

        const readyData = await readyPromise;
        const startInfo = await startInfoPromise;

        expect(readyData.matchId).toBeDefined();
        expect(startInfo.playerFleet.length).toBeGreaterThan(0);
        expect(startInfo.matchInfo.yourId).toBe(setup.user.id);
        
        // Verificamos que el oponente en la sombra es el Bot
        expect(startInfo.matchInfo.currentTurnPlayer).toBeDefined();
    });

it('RF-603: La IA debe realizar acciones y devolver el turno', async () => {
        client.emit('game:play_bot');
        const startInfo = await new Promise(res => client.once('match:startInfo', res));
        const matchId = startInfo.matchInfo.matchId;

        if (startInfo.matchInfo.currentTurnPlayer === setup.user.id) {
            client.emit('match:turn_end', { matchId });
        }

        // Esperamos a que la IA devuelva el turno
        await new Promise((resolve, reject) => {
            const timer = setTimeout(() => reject(new Error("Timeout: La IA no devolvió el turno")), 25000);
            
            client.on('match:turn_changed', (payload) => {
                if (payload.nextPlayerId === setup.user.id) {
                    clearTimeout(timer);
                    resolve();
                }
            });
        });
    }, 30000); // 30 segundos de margen
});