import request from 'supertest';
import app from '../../../src/app.js';
import { Match, MatchPlayer, sequelize, ShipInstance, ShipTemplate, User, UserShip } from '../../../src/shared/models/index.js';

describe('Engine Projectiles API Integration Tests', () => {
    let token, matchId, shipId;

    beforeAll(async () => {
        await sequelize.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
        await sequelize.sync({ force: true });

        const userRes = await request(app).post('/api/auth/register').send({
            username: 'proj_master', email: 'pm@test.com', contrasena: 'Pass1234'
        });
        token = userRes.body.token;
        const u = await User.findOne({ where: { email: 'pm@test.com' } });

        await ShipTemplate.create({ slug: 'fragata', name: 'F', width: 1, height: 3, baseMaxHp: 30, supplyCost: 15 });
        const uShip = await UserShip.create({ userId: u.id, templateSlug: 'fragata' });

        const m = await Match.create({ status: 'PLAYING', mapTerrain: { size: 15 }, turnNumber: 1 });
        matchId = m.id;

        await MatchPlayer.create({ matchId, userId: u.id, side: 'NORTH', ammoCurrent: 10 });

        const inst = await ShipInstance.create({
            matchId, playerId: u.id, userShipId: uShip.id,
            x: 5, y: 5, orientation: 'N', currentHp: 30
        });
        shipId = inst.id;
    });

    afterAll(async () => {
        await sequelize.close();
    });

    it('Debe permitir colocar una mina en una posición adyacente', async () => {
        const res = await request(app)
            .post(`/api/engine/${matchId}/attack/mine`)
            .set('Authorization', `Bearer ${token}`)
            .send({ shipId, target: { x: 5, y: 4 } });

        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Mina colocada');
    });

    it('Debe rechazar el lanzamiento de torpedo si no hay munición suficiente', async () => {
        await MatchPlayer.update({ ammoCurrent: 0 }, { where: { matchId } });

        const res = await request(app)
            .post(`/api/engine/${matchId}/attack/torpedo`)
            .set('Authorization', `Bearer ${token}`)
            .send({ shipId });

        expect(res.status).toBe(403);
    });
});