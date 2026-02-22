/**
 * Test de Integración: API de Usuarios (Refactorizado)
 */
import request from 'supertest';
import app from '../../../app.js';
import { sequelize } from '../../../config/db.js';
import { createFullUserContext } from '../../../shared/models/testFactory.js';
import { generarTokenAcceso } from '../../auth/services/authService.js';

describe('UserController API Integration (Finalized)', () => {
    let setup, token;

    beforeAll(async () => {
        await sequelize.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
        await sequelize.sync({ force: true });

        setup = await createFullUserContext('profile_tester', 'p@test.va');
        token = generarTokenAcceso(setup.user);
    });

    afterAll(async () => {
        await sequelize.close();
    });

    it('PATCH /api/auth/me - Debe permitir cambiar el nombre de usuario', async () => {
        const res = await request(app)
            .patch('/api/auth/me')
            .set('Authorization', `Bearer ${token}`)
            .send({ username: 'nuevo_nombre' });

        expect(res.status).toBe(200);
        expect(res.body.user.username).toBe('nuevo_nombre');
    });

    it('GET /api/auth/me - Debe devolver los datos actualizados', async () => {
        const res = await request(app)
            .get('/api/auth/me')
            .set('Authorization', `Bearer ${token}`);

        expect(res.body.username).toBe('nuevo_nombre');
    });
});