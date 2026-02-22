/**
 * Test de Integración: Gestión de Turnos V1
 * Valida que el oponente reciba +10 MP (cap 30) y reset de AP a 5.
 */
import request from 'supertest';
import app from '../../../app.js';
import { sequelize } from '../../../config/db.js';
import { Match, MatchPlayer } from '../../../shared/models/index.js';
import User from '../../auth/models/User.js';
import { generarTokenAcceso } from '../../auth/services/authService.js';

describe('TurnController Integration (Colocated)', () => {
    let tokenP1, matchId, p1Id, p2Id;

    beforeAll(async () => {
        await sequelize.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
        await sequelize.sync({ force: true });

        const u1 = await User.create({ username: 'p1', email: 'p1@t.com', password_hash: '1' });
        const u2 = await User.create({ username: 'p2', email: 'p2@t.com', password_hash: '1' });

        p1Id = u1.id;
        p2Id = u2.id;
        tokenP1 = generarTokenAcceso(u1);

        const match = await Match.create({
            status: 'PLAYING',
            mapTerrain: { size: 15 },
            currentTurnPlayerId: p1Id,
            turnNumber: 1
        });
        matchId = match.id;

        await MatchPlayer.create({ matchId, userId: p1Id, side: 'NORTH', fuelReserve: 10, ammoCurrent: 5 });
        // P2 empieza con 10 MP y 0 AP para probar la regeneración
        await MatchPlayer.create({ matchId, userId: p2Id, side: 'SOUTH', fuelReserve: 10, ammoCurrent: 0 });
    });

    afterAll(async () => {
        await sequelize.close();
    });

    it('POST /api/matches/:matchId/turn/end - Debe avanzar turno y regenerar recursos de P2', async () => {
        const res = await request(app)
            .post(`/api/matches/${matchId}/turn/end`)
            .set('Authorization', `Bearer ${tokenP1}`);

        expect(res.status).toBe(200);
        expect(res.body.nextPlayerId).toBe(p2Id);
        expect(res.body.turnNumber).toBe(2);

        // P2: 10 MP + 10 = 20 MP. AP reset a 5.
        expect(res.body.nextPlayerResources.fuel).toBe(20);
        expect(res.body.nextPlayerResources.ammo).toBe(5);
    });

    it('Debe denegar fin de turno si el jugador ya no es el activo', async () => {
        const res = await request(app)
            .post(`/api/matches/${matchId}/turn/end`)
            .set('Authorization', `Bearer ${tokenP1}`);

        expect(res.status).toBe(403);
    });
});