/**
 * Test de Integración: API de Autenticación
 * Valida los flujos de registro y login mediante peticiones HTTP reales.
 */
import request from 'supertest';
import app from '../../../app.js';
import { sequelize } from '../../../config/db.js';
import User from '../models/User.js';

describe('AuthController API Integration (Colocated)', () => {
    beforeAll(async () => {
        await sequelize.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
        await sequelize.sync({ force: true });
    });

    afterAll(async () => {
        await sequelize.close();
    });

    it('POST /api/auth/register - Debe crear un usuario y devolver un token', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                username: 'nuevo_usuario',
                email: 'nuevo@test.com',
                contrasena: 'Password123'
            });

        expect(res.status).toBe(201);
        expect(res.body.token).toBeDefined();

        const usuarioEnDb = await User.findOne({ where: { email: 'nuevo@test.com' } });
        expect(usuarioEnDb).not.toBeNull();
    });

    it('POST /api/auth/login - Debe fallar con contraseña incorrecta', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'nuevo@test.com',
                contrasena: 'WrongPass'
            });

        expect(res.status).toBe(401);
        expect(res.body.message).toBe('Credenciales inválidas');
    });

    it('POST /api/auth/login - Debe entrar con credenciales correctas', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'nuevo@test.com',
                contrasena: 'Password123'
            });

        expect(res.status).toBe(200);
        expect(res.body.token).toBeDefined();
    });
});