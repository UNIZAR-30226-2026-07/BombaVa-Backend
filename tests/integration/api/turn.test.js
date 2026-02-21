import request from 'supertest';
import app from '../../../src/app.js';
import { Match, MatchPlayer, sequelize, User } from '../../../src/shared/models/index.js';

describe('Turn Management API Integration Tests', () => {
    let tokenP1, matchId, user1Id, user2Id;

    beforeAll(async () => {
        await sequelize.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
        await sequelize.sync({ force: true });

        const res1 = await request(app).post('/api/auth/register').send({
            username: 'player1', email: 'p1@test.com', contrasena: 'Pass1234'
        });
        tokenP1 = res1.body.token;
        const u1 = await User.findOne({ where: { email: 'p1@test.com' } });
        user1Id = u1.id;

        const res2 = await request(app).post('/api/auth/register').send({
            username: 'player2', email: 'p2@test.com', contrasena: 'Pass1234'
        });
        const u2 = await User.findOne({ where: { email: 'p2@test.com' } });
        user2Id = u2.id;

        const partida = await Match.create({
            status: 'PLAYING',
            mapTerrain: { size: 15 },
            turnNumber: 1,
            currentTurnPlayerId: user1Id
        });
        matchId = partida.id;

        await MatchPlayer.create({ matchId, userId: user1Id, side: 'NORTH', fuelReserve: 10, ammoCurrent: 0 });
        await MatchPlayer.create({ matchId, userId: user2Id, side: 'SOUTH', fuelReserve: 10, ammoCurrent: 0 });
    });

    afterAll(async () => {
        await sequelize.close();
    });

    it('Debe avanzar el turno y regenerar recursos del oponente', async () => {
        const res = await request(app)
            .post(`/api/matches/${matchId}/turn/end`)
            .set('Authorization', `Bearer ${tokenP1}`);

        expect(res.status).toBe(200);
        expect(res.body.nextPlayerId).toBe(user2Id);
        expect(res.body.turnNumber).toBe(2);

        // Player 2 tenía 10 MP -> +10 = 20. Ammo reset a 5.
        expect(res.body.nextPlayerResources.fuel).toBe(20);
        expect(res.body.nextPlayerResources.ammo).toBe(5);
    });

    it('Debe denegar el fin de turno si no es el jugador activo', async () => {
        // Ahora el turno es de Player 2, intentamos terminarlo con el token de Player 1
        const res = await request(app)
            .post(`/api/matches/${matchId}/turn/end`)
            .set('Authorization', `Bearer ${tokenP1}`);

        expect(res.status).toBe(403);
        expect(res.body.message).toBe('No es tu turno');
    });
});