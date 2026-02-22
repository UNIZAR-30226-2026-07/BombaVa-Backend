/**
 * Test de Integración: API de Usuarios
 * Valida los endpoints /me y /ranking con una base de datos real.
 */
import request from 'supertest';
import app from '../../../app.js';
import { sequelize } from '../../../config/db.js';
import User from '../models/User.js';

describe('UserController API Integration (Colocated)', () => {
    let token;

    beforeAll(async () => {
        await sequelize.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
        await sequelize.sync({ force: true });

        const res = await request(app).post('/api/auth/register').send({
            username: 'api_tester',
            email: 'api@test.com',
            contrasena: 'Pass1234'
        });
        token = res.body.token;

        await User.create({ username: 'pro', email: 'pro@test.com', password_hash: '1', elo_rating: 1500 });
        await User.create({ username: 'noob', email: 'noob@test.com', password_hash: '1', elo_rating: 900 });
    });

    afterAll(async () => {
        await sequelize.close();
    });

    it('GET /api/auth/me - Debe devolver el perfil del usuario autenticado', async () => {
        const res = await request(app)
            .get('/api/auth/me')
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.username).toBe('api_tester');
        expect(res.body).not.toHaveProperty('password_hash');
    });

    it('GET /api/auth/ranking - Debe devolver la lista ordenada por ELO', async () => {
        const res = await request(app)
            .get('/api/auth/ranking')
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body[0].username).toBe('pro');
        expect(res.body[res.body.length - 1].username).toBe('noob');
    });

    it('Debe denegar el acceso si no se proporciona token', async () => {
        const res = await request(app).get('/api/auth/me');
        expect(res.status).toBe(401);
    });
});