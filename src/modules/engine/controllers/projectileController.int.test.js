/**
 * Test de Integración: Proyectiles
 * Valida la creación de torpedos y minas con persistencia real.
 */
import request from 'supertest';
import app from '../../../app.js';
import { sequelize } from '../../../config/db.js';
import { createMatchWithInstance } from '../../../shared/models/testFactory.js';
import { generarTokenAcceso } from '../../auth/services/authService.js';

describe('ProjectileController Integration (Refactored)', () => {
    let setup, token;

    beforeAll(async () => {
        await sequelize.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
        await sequelize.sync({ force: true });

        setup = await createMatchWithInstance('proj_test', 'p@t.com', { x: 5, y: 5 });
        token = generarTokenAcceso(setup.user);
    });

    afterAll(async () => {
        await sequelize.close();
    });

    it('POST /api/engine/:id/attack/torpedo - Debe lanzar torpedo y cobrar 3 AP', async () => {
        const res = await request(app)
            .post(`/api/engine/${setup.match.id}/attack/torpedo`)
            .set('Authorization', `Bearer ${token}`)
            .send({ shipId: setup.instance.id });

        expect(res.status).toBe(200);
        expect(res.body.ammoCurrent).toBe(7); // 10 - 3
    });

    it('POST /api/engine/:id/attack/mine - Debe colocar mina y cobrar 2 AP', async () => {
        const res = await request(app)
            .post(`/api/engine/${setup.match.id}/attack/mine`)
            .set('Authorization', `Bearer ${token}`)
            .send({ shipId: setup.instance.id, target: { x: 5, y: 4 } });

        expect(res.status).toBe(200);
    });
});