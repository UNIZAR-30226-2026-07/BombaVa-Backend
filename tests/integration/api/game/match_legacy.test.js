import request from 'supertest';
import app from '../../../src/app.js';
import { Match, sequelize } from '../../../src/shared/models/index.js';

describe('Match API Integration Tests', () => {
    let token;
    let matchId;

    beforeAll(async () => {
        await sequelize.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
        await sequelize.sync({ force: true });

        const userRes = await request(app).post('/api/auth/register').send({
            username: 'p_test',
            email: 'p@test.com',
            contrasena: 'Pass1234'
        });
        token = userRes.body.token;

        const partida = await Match.create({
            status: 'PLAYING',
            mapTerrain: { size: 15, obstacles: [] }
        });
        matchId = partida.id;
    });

    afterAll(async () => {
        await sequelize.close();
    });

    it('Debe obtener el estado de una partida existente', async () => {
        const res = await request(app)
            .get(`/api/matches/${matchId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.id).toBe(matchId);
    });

    it('Debe devolver 404 para una partida inexistente con UUID válido', async () => {
        const fakeId = '550e8400-e29b-41d4-a716-446655449999';
        const res = await request(app)
            .get(`/api/matches/${fakeId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(404);
    });
});