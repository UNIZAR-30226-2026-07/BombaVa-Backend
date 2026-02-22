/**
 * Test de Integración: API de Estado de Partida
 * Valida la rendición y las condiciones de victoria de la V1.
 */
import request from 'supertest';
import app from '../../../app.js';
import { sequelize } from '../../../config/db.js';
import { createCompleteMatch } from '../../../shared/models/testFactory.js';
import { generarTokenAcceso } from '../../auth/services/authService.js';
import Match from '../models/Match.js';

describe('MatchStatusController API Integration (Refactored)', () => {
    let setup, token;

    beforeAll(async () => {
        await sequelize.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
        await sequelize.sync({ force: true });

        setup = await createCompleteMatch(
            { username: 'status_host', email: 'h@s.va' },
            { username: 'status_guest', email: 'g@s.va' }
        );
        token = generarTokenAcceso(setup.host.user);
    });

    afterAll(async () => {
        await sequelize.close();
    });

    it('POST /api/matches/:id/surrender - Debe marcar la partida como FINISHED tras la rendición', async () => {
        const res = await request(app)
            .post(`/api/matches/${setup.match.id}/surrender`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);

        const match = await Match.findByPk(setup.match.id);
        expect(match.status).toBe('FINISHED');
    });
});