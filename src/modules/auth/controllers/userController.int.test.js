/**
 * Test de Integración: API de Usuarios
 */
import request from 'supertest';
import app from '../../../app.js';
import { sequelize } from '../../../config/db.js';
import { createFullUserContext } from '../../../shared/index.js';
import { generarTokenAcceso } from '../../auth/services/authService.js';

describe('UserController API Integration', () => {
    let setup, token;

    beforeAll(async () => {
        await sequelize.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
        await sequelize.sync({ force: true });

        setup = await createFullUserContext('profile_tester', 'profile@test.com');
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
});