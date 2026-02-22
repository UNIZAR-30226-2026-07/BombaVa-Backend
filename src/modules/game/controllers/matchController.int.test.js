/**
 * Test de Integración: Controlador de Partidas (API)
 * Valida la recuperación de estados y el flujo de historial usando la factoría.
 */
import request from 'supertest';
import app from '../../../app.js';
import { sequelize } from '../../../config/db.js';
import { createCompleteMatch } from '../../../shared/models/testFactory.js';
import { generarTokenAcceso } from '../../auth/services/authService.js';

describe('MatchController API Integration (Refactored)', () => {
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

    it('GET /api/matches/history - Debe devolver el historial del jugador host', async () => {
        const res = await request(app)
            .get('/api/matches/history')
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body[0].id).toBe(setup.match.id);
    });

    it('GET /api/matches/:id - Debe obtener el estado completo incluyendo oponente', async () => {
        const res = await request(app)
            .get(`/api/matches/${setup.match.id}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.MatchPlayers).toHaveLength(2);
    });

    it('POST /api/matches/:id/pause - Debe permitir enviar solicitud de pausa', async () => {
        const res = await request(app)
            .post(`/api/matches/${setup.match.id}/pause`)
            .set('Authorization', `Bearer ${token}`)
            .send({ accept: false });

        expect(res.status).toBe(200);
        expect(res.body.message).toContain('enviada');
    });
});