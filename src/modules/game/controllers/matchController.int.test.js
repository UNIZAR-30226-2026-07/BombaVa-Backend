/**
 * Test de Integración: Controlador de Partidas (API)
 * Valida la recuperación de estados y el flujo de historial.
 */
import request from 'supertest';
import app from '../../../app.js';
import { sequelize } from '../../../config/db.js';
import { Match, MatchPlayer } from '../../../shared/models/index.js';
import User from '../../auth/models/User.js';
import { generarTokenAcceso } from '../../auth/services/authService.js';

describe('MatchController API Integration (Colocated)', () => {
    let token, userId, matchId;

    beforeAll(async () => {
        await sequelize.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
        await sequelize.sync({ force: true });

        const user = await User.create({ username: 'gamer_pro', email: 'pro@test.com', password_hash: '1' });
        userId = user.id;
        token = generarTokenAcceso(user);

        const m = await Match.create({
            status: 'PLAYING',
            mapTerrain: { size: 15 },
            turnNumber: 5
        });
        matchId = m.id;

        await MatchPlayer.create({ matchId, userId, side: 'NORTH' });
    });

    afterAll(async () => {
        await sequelize.close();
    });

    it('GET /api/matches/history - Debe devolver las partidas del usuario', async () => {
        const res = await request(app)
            .get('/api/matches/history')
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body[0].id).toBe(matchId);
    });

    it('GET /api/matches/:id - Debe devolver el estado completo de la sesión', async () => {
        const res = await request(app)
            .get(`/api/matches/${matchId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.turnNumber).toBe(5);
        expect(res.body.MatchPlayers).toBeDefined();
    });

    it('POST /api/matches/:id/pause - Debe tramitar la solicitud de pausa', async () => {
        const res = await request(app)
            .post(`/api/matches/${matchId}/pause`)
            .set('Authorization', `Bearer ${token}`)
            .send({ accept: false });

        expect(res.status).toBe(200);
        expect(res.body.message).toContain('enviada');
    });
});