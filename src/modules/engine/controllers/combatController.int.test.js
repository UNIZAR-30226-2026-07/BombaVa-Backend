/**
 * Test de Integración: Combate
 */
import request from 'supertest';
import app from '../../../app.js';
import { sequelize } from '../../../config/db.js';
import { Match, MatchPlayer, ShipInstance, ShipTemplate, UserShip } from '../../../shared/models/index.js';
import User from '../../auth/models/User.js';
import { generarTokenAcceso } from '../../auth/services/authService.js';

describe('CombatController Integration (Colocated)', () => {
    let token, matchId, shipId, userId;

    beforeAll(async () => {
        await sequelize.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
        await sequelize.sync({ force: true });

        const user = await User.create({ username: 'gunner', email: 'g@t.com', password_hash: '1' });
        userId = user.id;
        token = generarTokenAcceso(user);

        const template = await ShipTemplate.create({ slug: 'lancha', name: 'L', baseMaxHp: 10, supplyCost: 5 });
        const uShip = await UserShip.create({ userId, templateSlug: template.slug });

        const match = await Match.create({
            status: 'PLAYING',
            mapTerrain: { size: 15 },
            turnNumber: 1
        });
        matchId = match.id;

        await MatchPlayer.create({ matchId, userId, side: 'NORTH', ammoCurrent: 5 });

        const inst = await ShipInstance.create({
            matchId, playerId: userId, userShipId: uShip.id,
            x: 2, y: 2, orientation: 'N', currentHp: 10, lastAttackTurn: 0
        });
        shipId = inst.id;
    });

    afterAll(async () => {
        await sequelize.close();
    });

    it('Debe permitir el primer ataque y descontar 2 AP', async () => {
        const res = await request(app)
            .post(`/api/engine/${matchId}/attack/cannon`)
            .set('Authorization', `Bearer ${token}`)
            .send({ shipId, target: { x: 5, y: 5 } });

        expect(res.status).toBe(200);
        expect(res.body.ammoCurrent).toBe(3);
    });

    it('Debe denegar el segundo ataque en el mismo turno con el mismo barco', async () => {
        const res = await request(app)
            .post(`/api/engine/${matchId}/attack/cannon`)
            .set('Authorization', `Bearer ${token}`)
            .send({ shipId, target: { x: 5, y: 5 } });

        expect(res.status).toBe(403);
    });
});