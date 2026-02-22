/**
 * Test de Integración: API de Autenticación (Refactorizado con Factoría)
 * Valida los flujos de acceso utilizando el contexto de datos centralizado.
 */
import request from 'supertest';
import app from '../../../app.js';
import { sequelize } from '../../../config/db.js';
import { createFullUserContext } from '../../../shared/models/testFactory.js';

describe('AuthController API Integration (Refactored)', () => {
    let setup;

    beforeAll(async () => {
        await sequelize.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
        await sequelize.sync({ force: true });

        setup = await createFullUserContext('auth_tester', 'auth@test.va');
    });

    afterAll(async () => {
        await sequelize.close();
    });

    it('POST /api/auth/register - Debe permitir registrar un usuario nuevo', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                username: 'nuevo_registro',
                email: 'nuevo@registro.va',
                contrasena: 'Pass1234'
            });

        expect(res.status).toBe(201);
        expect(res.body.token).toBeDefined();
    });

    it('POST /api/auth/login - Debe entrar con el usuario de la factoría', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'auth@test.va',
                contrasena: 'test_hash'
            });

        expect(res.status).toBe(200);
        expect(res.body.username).toBe('auth_tester');
        expect(res.body.token).toBeDefined();
    });

    it('POST /api/auth/login - Debe fallar con contraseña errónea', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'auth@test.va',
                contrasena: 'wrong_pass'
            });

        expect(res.status).toBe(401);
    });
});