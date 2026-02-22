/**
 * Test de Integración: Proyectiles
 */
import request from 'supertest';
import app from '../../../app.js';
import { sequelize } from '../../../config/db.js';
import { Match, MatchPlayer, ShipInstance, ShipTemplate, UserShip } from '../../../shared/models/index.js';
import User from '../../auth/models/User.js';
import { generarTokenAcceso } from '../../auth/services/authService.js';

describe('ProjectileController Integration (Colocated)', () => {
    let token, matchId, shipId, userId;

    beforeAll(async () => {
        await sequelize.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
        await sequelize.sync({ force: true });

        const user = await User.create({ username: 'artiller', email: 'a@t.com', password_hash: '1' });
        userId = user.id;
        token = generarTokenAcceso(user);

        const template = await ShipTemplate.create({ slug: 'fragata', name: 'F', baseMaxHp: 30, supplyCost: 15 });
        const uShip = await UserShip.create({ userId, templateSlug: template.slug });

        const match = await Match.create({ status: 'PLAYING', mapTerrain: { size: 15 }, turnNumber: 1 });
        matchId = match.id;

        await MatchPlayer.create({ matchId, userId, side: 'NORTH', ammoCurrent: 10 });

        const inst = await ShipInstance.create({
            matchId, playerId: userId, userShipId: uShip.id,
            x: 5, y: 5, orientation: 'N', currentHp: 30
        });
        shipId = inst.id;
    });

    afterAll(async () => {
        await sequelize.close();
    });

    it('POST /api/engine/:id/attack/torpedo - Debe crear un torpedo y cobrar 3 AP', async () => {
        const res = await request(app)
            .post(`/api/engine/${matchId}/attack/torpedo`)
            .set('Authorization', `Bearer ${token}`)
            .send({ shipId });

        expect(res.status).toBe(200);
        expect(res.body.ammoCurrent).toBe(7);
    });

    it('POST /api/engine/:id/attack/mine - Debe crear una mina adyacente y cobrar 2 AP', async () => {
        const res = await request(app)
            .post(`/api/engine/${matchId}/attack/mine`)
            .set('Authorization', `Bearer ${token}`)
            .send({ shipId, target: { x: 5, y: 6 } });

        expect(res.status).toBe(200);
        expect(res.body.message).toContain('colocada');
    });
});