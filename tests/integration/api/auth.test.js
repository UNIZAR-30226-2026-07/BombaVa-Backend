import request from 'supertest';
import app from '../../../src/app.js';
import { sequelize, User } from '../../../src/shared/models/index.js';

describe('Auth API (Integration)', () => {

    beforeAll(async () => {
        await sequelize.query('DROP SCHEMA public CASCADE;');
        await sequelize.query('CREATE SCHEMA public;');
        await sequelize.sync({ force: true });
    });

    afterAll(async () => {
        await sequelize.close();
    });

    describe('POST /api/auth/register', () => {
        it('Debe registrar un usuario, cifrar contraseña y devolver un JWT', async () => {
            const userData = {
                username: 'new_player',
                email: 'player@bombava.com',
                contrasena: 'Password123!' // El controlador espera 'contrasena' según el código
            };

            const response = await request(app)
                .post('/api/auth/register')
                .send(userData);

            // Verificación de respuesta
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('token');
            expect(typeof response.body.token).toBe('string');

            // Verificación en base de datos
            const savedUser = await User.findOne({ where: { username: 'new_player' } });
            expect(savedUser).not.toBeNull();
            // La contraseña no debe ser igual al texto plano
            expect(savedUser.password_hash).not.toBe('Password123!');
            // Debe ser un hash de bcrypt (empiezan por $2)
            expect(savedUser.password_hash.startsWith('$2')).toBe(true);
        });

        it('Debe fallar si el nombre de usuario ya existe', async () => {
            const userData = {
                username: 'new_player',
                email: 'other@bombava.com',
                contrasena: 'Password123!'
            };

            const response = await request(app)
                .post('/api/auth/register')
                .send(userData);

            expect(response.status).toBe(400);
            // El controlador lanza "El nombre de usuario ya esta en uso"
        });
    });
});