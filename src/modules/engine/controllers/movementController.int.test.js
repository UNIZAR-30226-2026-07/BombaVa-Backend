/**
 * Test de Integración: Movimiento
 * Valida el desplazamiento y rotación usando el setup centralizado.
 */
import request from 'supertest';
import app from '../../../app.js';
import { sequelize } from '../../../config/db.js';
import { createMatchWithInstance } from '../../../shared/models/testFactory.js';
import { generarTokenAcceso } from '../../auth/services/authService.js';

describe('MovementController Integration (Refactored)', () => {
    let setup, token;

    beforeAll(async () => {
        await sequelize.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
        await sequelize.sync({ force: true });

        setup = await createMatchWithInstance('sailor_test', 's@t.com', { x: 5, y: 5 });
        token = generarTokenAcceso(setup.user);
    });

    afterAll(async () => {
        await sequelize.close();
    });

    it('POST /api/engine/:matchId/move - Debe avanzar el barco y descontar fuel', async () => {
        const res = await request(app)
            .post(`/api/engine/${setup.match.id}/move`)
            .set('Authorization', `Bearer ${token}`)
            .send({ shipId: setup.instance.id, direction: 'S' });

        expect(res.status).toBe(200);
        expect(res.body.position.y).toBe(6);
        expect(res.body.fuelReserve).toBeLessThan(20);
    });

    it('POST /api/engine/:matchId/rotate - Debe rotar el barco 90 grados', async () => {
        const res = await request(app)
            .post(`/api/engine/${setup.match.id}/rotate`)
            .set('Authorization', `Bearer ${token}`)
            .send({ shipId: setup.instance.id, degrees: 90 });

        expect(res.status).toBe(200);
        expect(res.body.orientation).toBe('E');
    });
});