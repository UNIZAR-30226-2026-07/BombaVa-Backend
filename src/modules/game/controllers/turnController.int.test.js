/**
 * Test de Integración: Gestión de Turnos
 * Valida la transición de turno y regeneración de recursos.
 */
import request from 'supertest';
import app from '../../../app.js';
import { sequelize } from '../../../config/db.js';
import { createCompleteMatch } from '../../../shared/models/testFactory.js';
import { generarTokenAcceso } from '../../auth/services/authService.js';

describe('TurnController Integration (Refactored)', () => {
    let setup, tokenHost;

    beforeAll(async () => {
        await sequelize.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
        await sequelize.sync({ force: true });

        setup = await createCompleteMatch(
            { username: 'host', email: 'h@t.com' },
            { username: 'guest', email: 'g@t.com' }
        );
        tokenHost = generarTokenAcceso(setup.host.user);
    });

    afterAll(async () => {
        await sequelize.close();
    });

    it('POST /api/matches/:id/turn/end - Debe pasar el turno al invitado y regenerar sus recursos', async () => {
        const res = await request(app)
            .post(`/api/matches/${setup.match.id}/turn/end`)
            .set('Authorization', `Bearer ${tokenHost}`);

        expect(res.status).toBe(200);
        expect(res.body.nextPlayerId).toBe(setup.guest.user.id);
        // P2 tenía 10 MP + 10 regenerados = 20. Ammo reset a 5.
        expect(res.body.nextPlayerResources.fuel).toBe(20);
        expect(res.body.nextPlayerResources.ammo).toBe(5);
    });
});