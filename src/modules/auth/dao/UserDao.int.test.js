/**
 * Test de Integración: DAO de Usuarios
 * Valida la persistencia y búsqueda de perfiles usando la factoría.
 */
import { sequelize } from '../../../config/db.js';
import { createFullUserContext } from '../../../shared/models/testFactory.js';
import UserDao from './UserDao.js';

describe('UserDao Integration (Refactored)', () => {
    let setup;

    beforeAll(async () => {
        await sequelize.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
        await sequelize.sync({ force: true });

        setup = await createFullUserContext('search_user', 'search@test.com');
    });

    afterAll(async () => {
        await sequelize.close();
    });

    it('findByMail - Debe encontrar al usuario creado por la factoría', async () => {
        const user = await UserDao.findByMail('search@test.com');
        expect(user).not.toBeNull();
        expect(user.username).toBe('search_user');
    });

    it('findById - Debe encontrar al usuario por su UUID', async () => {
        const user = await UserDao.findById(setup.user.id);
        expect(user).not.toBeNull();
        expect(user.id).toBe(setup.user.id);
    });
});