import request from 'supertest';
import app from '../../../src/app.js';
import { Match, MatchPlayer, sequelize, ShipInstance, ShipTemplate, User, UserShip } from '../../../src/shared/models/index.js';

describe('Game Engine API Integration Tests', () => {
    let token, matchId, shipId;

    beforeAll(async () => {
        await sequelize.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
        await sequelize.sync({ force: true });

        const userRes = await request(app).post('/api/auth/register').send({
            username: 'admiral', email: 'admiral@test.com', contrasena: 'Pass1234'
        });
        token = userRes.body.token;
        const user = await User.findOne({ where: { email: 'admiral@test.com' } });

        await ShipTemplate.create({ slug: 'fragata', name: 'Fragata', width: 1, height: 3, baseMaxHp: 30, supplyCost: 15 });
        const userShip = await UserShip.create({ userId: user.id, templateSlug: 'fragata' });

        const partida = await Match.create({ status: 'PLAYING', mapTerrain: { size: 15, obstacles: [] } });
        matchId = partida.id;

        await MatchPlayer.create({ matchId, userId: user.id, side: 'NORTH', fuelReserve: 10 });

        const instancia = await ShipInstance.create({
            matchId, playerId: user.id, userShipId: userShip.id,
            x: 5, y: 5, orientation: 'N', currentHp: 30
        });
        shipId = instancia.id;
    });

    afterAll(async () => {
        await sequelize.close();
    });

    it('Debe mover el barco hacia el Sur y descontar 1 MP', async () => {
        const res = await request(app)
            .post(`/api/engine/${matchId}/move`)
            .set('Authorization', `Bearer ${token}`)
            .send({ shipId, direction: 'S' });

        expect(res.status).toBe(200);
        expect(res.body.fuelReserve).toBe(9);
        expect(res.body.position.y).toBe(6);
    });

    it('Debe rotar el barco 90 grados y descontar 2 MP', async () => {
        const res = await request(app)
            .post(`/api/engine/${matchId}/rotate`)
            .set('Authorization', `Bearer ${token}`)
            .send({ shipId, degrees: 90 });

        expect(res.status).toBe(200);
        expect(res.body.fuelReserve).toBe(7); // 9 anterior - 2 rotacion
        expect(res.body.orientation).toBe('E'); // De N a E son 90 grados
    });

    it('Debe rechazar movimiento si no hay combustible', async () => {
        // Gastamos el resto del combustible (quedan 7)!!
        await MatchPlayer.update({ fuelReserve: 0 }, { where: { matchId } });

        const res = await request(app)
            .post(`/api/engine/${matchId}/move`)
            .set('Authorization', `Bearer ${token}`)
            .send({ shipId, direction: 'N' });

        expect(res.status).toBe(403);
    });
});