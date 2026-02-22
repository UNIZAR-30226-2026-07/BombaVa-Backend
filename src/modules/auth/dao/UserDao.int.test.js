/**
 * Test de Integración: DAO de Usuarios
 * Valida que las consultas de Sequelize funcionen contra la base de datos real.
 */
import { sequelize } from '../../../config/db.js';
import UserDao from './UserDao.js';

describe('UserDao Integration (Colocated)', () => {
    beforeAll(async () => {
        await sequelize.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
        await sequelize.sync({ force: true });
    });

    afterAll(async () => {
        await sequelize.close();
    });

    it('createUser y findByMail - Debe persistir y recuperar por email', async () => {
        await UserDao.createUser({
            username: 'dao_user',
            email: 'dao@test.com',
            password_hash: 'hash'
        });

        const user = await UserDao.findByMail('dao@test.com');
        expect(user).not.toBeNull();
        expect(user.username).toBe('dao_user');
    });

    it('findByName - Debe recuperar por nombre de usuario', async () => {
        const user = await UserDao.findByName('dao_user');
        expect(user).not.toBeNull();
        expect(user.email).toBe('dao@test.com');
    });
});