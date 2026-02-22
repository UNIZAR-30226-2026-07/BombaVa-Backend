/**
 * Test de Integración: Combate
 * Valida las reglas de ataque de la V1 con un setup desacoplado.
 */
import request from 'supertest';
import app from '../../../app.js';
import { sequelize } from '../../../config/db.js';
import { createMatchWithInstance } from '../../../shared/models/testFactory.js';
import { generarTokenAcceso } from '../../auth/services/authService.js';

describe('CombatController Integration (Refactored)', () => {
    let setup, token;

    beforeAll(async () => {
        await sequelize.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
        await sequelize.sync({ force: true });

        setup = await createMatchWithInstance('combat_test', 'c@t.com', { x: 2, y: 2 });
        token = generarTokenAcceso(setup.user);
    });

    afterAll(async () => {
        await sequelize.close();
    });

    it('POST /api/engine/:matchId/attack/cannon - Debe impactar y descontar AP', async () => {
        const res = await request(app)
            .post(`/api/engine/${setup.match.id}/attack/cannon`)
            .set('Authorization', `Bearer ${token}`)
            .send({ shipId: setup.instance.id, target: { x: 2, y: 3 } });

        expect(res.status).toBe(200);
        expect(res.body.ammoCurrent).toBe(8); // 10 - 2
    });

    it('Debe denegar un segundo ataque del mismo barco en el mismo turno', async () => {
        const res = await request(app)
            .post(`/api/engine/${setup.match.id}/attack/cannon`)
            .set('Authorization', `Bearer ${token}`)
            .send({ shipId: setup.instance.id, target: { x: 2, y: 3 } });

        expect(res.status).toBe(403);
    });
});