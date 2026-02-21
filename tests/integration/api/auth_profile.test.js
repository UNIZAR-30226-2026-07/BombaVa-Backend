import request from 'supertest';
import app from '../../../src/app.js';
import { sequelize } from '../../../src/shared/models/index.js';

describe('Auth Profile API Integration Tests', () => {
    let token;

    beforeAll(async () => {
        await sequelize.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
        await sequelize.sync({ force: true });

        const userRes = await request(app).post('/api/auth/register').send({
            username: 'perfil_tester',
            email: 'perfil@test.com',
            contrasena: 'Pass1234'
        });
        token = userRes.body.token;
    });

    afterAll(async () => {
        await sequelize.close();
    });

    it('Debe obtener los datos del perfil del usuario autenticado correctamente', async () => {
        const res = await request(app)
            .get('/api/auth/me')
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.username).toBe('perfil_tester');
        expect(res.body.email).toBe('perfil@test.com');
        expect(res.body).toHaveProperty('elo_rating');
        expect(res.body).not.toHaveProperty('password_hash');
    });

    it('Debe denegar el acceso al perfil si no se proporciona un token válido', async () => {
        const res = await request(app).get('/api/auth/me');
        expect(res.status).toBe(401);
    });
});