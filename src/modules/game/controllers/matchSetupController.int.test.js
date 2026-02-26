/**
 * Test de Integración: Setup de Partida
 * Valida que la orquestación inicial de barcos y bandos sea correcta.
 */
import { sequelize } from '../../../config/db.js';
import { ShipInstance } from '../../../shared/models/index.js';
import { createFullUserContext } from '../../../shared/models/testFactory.js';
import { iniciarPartidaOrquestada } from '../services/matchService.js';

describe('MatchSetupController Integration (Refactored)', () => {
    let hostCtx, guestCtx;

    beforeAll(async () => {
        await sequelize.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
        await sequelize.sync({ force: true });

        // Setup limpio para ambos jugadores usando la factoría
        hostCtx = await createFullUserContext('host_v1', 'h@v1.va');
        guestCtx = await createFullUserContext('guest_v1', 'g@v1.va');
    });

    afterAll(async () => {
        await sequelize.close();
    });

    it('Debe orquestar la partida y posicionar barcos en extremos opuestos del mapa', async () => {
        const match = await iniciarPartidaOrquestada([
            { id: hostCtx.user.id, socketId: 's1' },
            { id: guestCtx.user.id, socketId: 's2' }
        ]);

        expect(match.id).toBeDefined();

        // Host (Norte): Fila 0
        const shipH = await ShipInstance.findOne({ where: { matchId: match.id, playerId: hostCtx.user.id } });
        expect(shipH.y).toBe(0);

        // Guest (Sur): Fila 14 (Traducción 14 - Y)
        const shipG = await ShipInstance.findOne({ where: { matchId: match.id, playerId: guestCtx.user.id } });
        expect(shipG.y).toBe(14);
    });
});