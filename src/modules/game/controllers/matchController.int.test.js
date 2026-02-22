/**
 * Test de Integración: Controlador de Partidas
 * Valida únicamente los endpoints de consulta asíncrona
 */
import request from 'supertest';
import app from '../../../app.js';
import { sequelize } from '../../../config/db.js';
import { createCompleteMatch } from '../../../shared/models/testFactory.js';
import { generarTokenAcceso } from '../../auth/services/authService.js';

describe('MatchController API Integration (REST History Only)', () => {
    let setup, token;

    beforeAll(async () => {
        await sequelize.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
        await sequelize.sync({ force: true });

        setup = await createCompleteMatch(
            { username: 'player_one', email: 'p1@test.com' },
            { username: 'player_two', email: 'p2@test.com' }
        );
        token = generarTokenAcceso(setup.host.user);
    });

    afterAll(async () => {
        await sequelize.close();
    });

    it('GET /api/matches/history - Debe devolver el historial del usuario autenticado', async () => {
        const res = await request(app)
            .get('/api/matches/history')
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body[0].id).toBe(setup.match.id);
    });
});