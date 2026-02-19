import request from 'supertest';
import app from '../../../src/app.js';
import { sequelize } from '../../../src/shared/models/index.js';

describe('Auth API Functional Tests (Integration)', () => {

    beforeAll(async () => {
        await sequelize.query('DROP SCHEMA public CASCADE;');
        await sequelize.query('CREATE SCHEMA public;');
        await sequelize.sync({ force: true });
    });

    afterAll(async () => {
        await sequelize.close();
    });

    describe('POST /api/auth/register', () => {

        it('Debe fallar si faltan campos obligatorios (Validación)', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({ username: 'solo_nombre' });

            // El servidor actual debería devolver 400 si implementamos validadores
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('errors');
        });

        it('Debe registrar correctamente un usuario válido', async () => {
            const userData = {
                username: 'tester_exhaustivo',
                email: 'ex@test.com',
                contrasena: 'Pass1234'
            };

            const response = await request(app)
                .post('/api/auth/register')
                .send(userData);

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('token');
        });

        it('Debe impedir el registro con un email que ya existe', async () => {
            const userData = {
                username: 'otro_user',
                email: 'ex@test.com', // Email ya usado arriba
                contrasena: 'Pass1234'
            };

            const response = await request(app)
                .post('/api/auth/register')
                .send(userData);

            // Sequelize o el Controlador deben lanzar error
            expect(response.status).toBe(400);
        });
    });
});