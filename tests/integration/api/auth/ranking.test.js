import request from 'supertest';
import app from '../../../src/app.js';
import { sequelize, User } from '../../../src/shared/models/index.js';

describe('Ranking API Integration Tests', () => {
    let token;

    beforeAll(async () => {
        await sequelize.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
        await sequelize.sync({ force: true });

        await User.create({ username: 'pro_player', email: 'pro@t.com', password_hash: '1', elo_rating: 2000 });
        await User.create({ username: 'noob_player', email: 'noob@t.com', password_hash: '1', elo_rating: 1000 });

        const res = await request(app).post('/api/auth/register').send({
            username: 'tester', email: 'tester@ranking.com', contrasena: 'Pass1234'
        });
        token = res.body.token;
    });

    afterAll(async () => {
        await sequelize.close();
    });

    it('Debe devolver la lista de jugadores ordenada por ELO de mayor a menor', async () => {
        const res = await request(app)
            .get('/api/auth/ranking')
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body[0].username).toBe('pro_player');
        expect(res.body[1].elo_rating).toBe(1200);
        expect(res.body[2].username).toBe('noob_player');
    });
});