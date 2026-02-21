import request from 'supertest';
import app from '../../../src/app.js';
import { Match, MatchPlayer, sequelize, ShipInstance, ShipTemplate, User, UserShip } from '../../../src/shared/models/index.js';

describe('Combat API Integration Tests', () => {
    let token, matchId, attackerShipId, targetShipId;

    beforeAll(async () => {
        await sequelize.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
        await sequelize.sync({ force: true });

        const userRes = await request(app).post('/api/auth/register').send({
            username: 'warrior', email: 'war@test.com', contrasena: 'Pass1234'
        });
        token = userRes.body.token;
        const user = await User.findOne({ where: { email: 'war@test.com' } });

        await ShipTemplate.create({ slug: 'lancha', name: 'L', width: 1, height: 1, baseMaxHp: 10, supplyCost: 5 });
        const uShip = await UserShip.create({ userId: user.id, templateSlug: 'lancha' });

        const partida = await Match.create({ status: 'PLAYING', mapTerrain: { size: 15, obstacles: [] }, turnNumber: 5 });
        matchId = partida.id;

        await MatchPlayer.create({ matchId, userId: user.id, side: 'NORTH', ammoCurrent: 10 });

        const attacker = await ShipInstance.create({
            matchId, playerId: user.id, userShipId: uShip.id,
            x: 2, y: 2, orientation: 'N', currentHp: 10
        });
        attackerShipId = attacker.id;

        const target = await ShipInstance.create({
            matchId, playerId: user.id, userShipId: uShip.id,
            x: 2, y: 3, orientation: 'S', currentHp: 10
        });
        targetShipId = target.id;
    });

    afterAll(async () => {
        await sequelize.close();
    });

    it('Debe impactar al objetivo con el cañón y reducir su HP', async () => {
        const res = await request(app)
            .post(`/api/engine/${matchId}/attack/cannon`)
            .set('Authorization', `Bearer ${token}`)
            .send({ shipId: attackerShipId, target: { x: 2, y: 3 } });

        expect(res.status).toBe(200);
        expect(res.body.hit).toBe(true);
        expect(res.body.targetHp).toBe(0);
    });

    it('Debe impedir atacar dos veces en el mismo turno con el mismo barco', async () => {
        const res = await request(app)
            .post(`/api/engine/${matchId}/attack/cannon`)
            .set('Authorization', `Bearer ${token}`)
            .send({ shipId: attackerShipId, target: { x: 0, y: 0 } });

        expect(res.status).toBe(403);
        expect(res.body.message).toContain('ya ha atacado');
    });
});