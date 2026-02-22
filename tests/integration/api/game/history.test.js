import request from 'supertest';
import app from '../../../src/app.js';
import { Match, MatchPlayer, sequelize, User } from '../../../src/shared/models/index.js';

describe('Match History API Integration Tests', () => {
    let token;
    let userId;

    beforeAll(async () => {
        await sequelize.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
        await sequelize.sync({ force: true });

        const userRes = await request(app).post('/api/auth/register').send({
            username: 'history_man',
            email: 'history@test.com',
            contrasena: 'Pass1234'
        });
        token = userRes.body.token;
        const user = await User.findOne({ where: { email: 'history@test.com' } });
        userId = user.id;

        const m1 = await Match.create({ status: 'FINISHED', mapTerrain: { size: 15 } });
        await MatchPlayer.create({ matchId: m1.id, userId: userId, side: 'NORTH' });

        const m2 = await Match.create({ status: 'PLAYING', mapTerrain: { size: 15 } });
        await MatchPlayer.create({ matchId: m2.id, userId: userId, side: 'SOUTH' });
    });

    afterAll(async () => {
        await sequelize.close();
    });

    it('Debe listar todas las partidas en las que ha participado el usuario', async () => {
        const res = await request(app)
            .get('/api/matches/history')
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(2);
        expect(res.body[0]).toHaveProperty('MatchPlayers');
    });

    it('Debe devolver una lista vacía si el usuario no tiene partidas', async () => {
        const otherUserRes = await request(app).post('/api/auth/register').send({
            username: 'newbie',
            email: 'newbie@test.com',
            contrasena: 'Pass1234'
        });

        const res = await request(app)
            .get('/api/matches/history')
            .set('Authorization', `Bearer ${otherUserRes.body.token}`);

        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(0);
    });
});