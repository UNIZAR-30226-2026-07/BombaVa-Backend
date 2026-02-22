/**
 * Test de Integración: API de Usuario
 */
import request from 'supertest';
import app from '../../../app.js';
import { sequelize } from '../../../config/db.js';
import { createFullUserContext } from '../../../shared/models/testFactory.js';
import { generarTokenAcceso } from '../../auth/services/authService.js';
import User from '../models/User.js';

describe('UserController API Integration (Refactored)', () => {
    let setup, token;

    beforeAll(async () => {
        await sequelize.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
        await sequelize.sync({ force: true });

        setup = await createFullUserContext('profile_user', 'p@t.com');
        token = generarTokenAcceso(setup.user);

        await User.create({ username: 'pro_player', email: 'pro@t.com', password_hash: '1', elo_rating: 2000 });
    });

    afterAll(async () => {
        await sequelize.close();
    });

    it('GET /api/auth/me - Debe devolver datos del perfil', async () => {
        const res = await request(app)
            .get('/api/auth/me')
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.username).toBe('profile_user');
    });

    it('GET /api/auth/ranking - Debe incluir al jugador pro en primer lugar', async () => {
        const res = await request(app)
            .get('/api/auth/ranking')
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body[0].username).toBe('pro_player');
    });
});