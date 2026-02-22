/**
 * Test de Integración: Movimiento
 */
import request from 'supertest';
import app from '../../../app.js';
import { sequelize } from '../../../config/db.js';
import { Match, MatchPlayer, ShipInstance, ShipTemplate, UserShip } from '../../../shared/models/index.js';
import User from '../../auth/models/User.js';
import { generarTokenAcceso } from '../../auth/services/authService.js';

describe('MovementController Integration (Colocated)', () => {
    let token, matchId, shipId, userId;

    beforeAll(async () => {
        await sequelize.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
        await sequelize.sync({ force: true });

        const user = await User.create({ username: 'sailor', email: 's@t.com', password_hash: '1' });
        userId = user.id;
        token = generarTokenAcceso(user);

        const template = await ShipTemplate.create({ slug: 'lancha', name: 'L', baseMaxHp: 10, supplyCost: 5 });
        const uShip = await UserShip.create({ userId, templateSlug: template.slug });

        const match = await Match.create({ status: 'PLAYING', mapTerrain: { size: 15 } });
        matchId = match.id;

        await MatchPlayer.create({ matchId, userId, side: 'NORTH', fuelReserve: 10 });

        const inst = await ShipInstance.create({
            matchId, playerId: userId, userShipId: uShip.id,
            x: 5, y: 5, orientation: 'N', currentHp: 10
        });
        shipId = inst.id;
    });

    afterAll(async () => {
        await sequelize.close();
    });

    it('POST /api/engine/:matchId/move - Debe descontar 1 MP y cambiar posición', async () => {
        const res = await request(app)
            .post(`/api/engine/${matchId}/move`)
            .set('Authorization', `Bearer ${token}`)
            .send({ shipId, direction: 'S' });

        expect(res.status).toBe(200);
        expect(res.body.fuelReserve).toBe(9);
    });

    it('POST /api/engine/:matchId/rotate - Debe descontar 2 MP y cambiar orientación', async () => {
        const res = await request(app)
            .post(`/api/engine/${matchId}/rotate`)
            .set('Authorization', `Bearer ${token}`)
            .send({ shipId, degrees: 90 });

        expect(res.status).toBe(200);
        expect(res.body.fuelReserve).toBe(7);
        expect(res.body.orientation).toBe('E');
    });
});