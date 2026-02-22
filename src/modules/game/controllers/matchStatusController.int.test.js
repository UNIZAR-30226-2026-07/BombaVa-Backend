/**
 * Test de Integración: API de Estado de Partida
 * Valida la rendición y las condiciones de victoria de la V1.
 */
import request from 'supertest';
import app from '../../../app.js';
import { sequelize } from '../../../config/db.js';
import User from '../../auth/models/User.js';
import { generarTokenAcceso } from '../../auth/services/authService.js';
import Match from '../models/Match.js';

describe('MatchStatusController API Integration (Colocated)', () => {
    let token, matchId;

    beforeAll(async () => {
        await sequelize.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
        await sequelize.sync({ force: true });

        const user = await User.create({ username: 'player_v1', email: 'v1@test.com', password_hash: '1' });
        token = generarTokenAcceso(user);

        const m = await Match.create({ status: 'PLAYING', mapTerrain: { size: 15 } });
        matchId = m.id;
    });

    afterAll(async () => {
        await sequelize.close();
    });

    it('POST /api/matches/:id/surrender - Debe marcar la partida como FINISHED', async () => {
        const res = await request(app)
            .post(`/api/matches/${matchId}/surrender`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        const match = await Match.findByPk(matchId);
        expect(match.status).toBe('FINISHED');
    });
});