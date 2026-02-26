/**
 * Test de Integración: Persistencia de Usuario
 * Valida la comunicación real con la base de datos PostgreSQL.
 */
import { sequelize } from '../../../config/db.js';
import User from './User.js';

describe('User Model Integration (Colocated)', () => {
    beforeAll(async () => {
        await sequelize.sync({ force: true });
    });

    afterEach(async () => {
        await User.destroy({ where: {} });
    });

    afterAll(async () => {
        await sequelize.close();
    });

    it('Debe persistir un usuario y recuperarlo con su ELO por defecto', async () => {
        const userData = {
            username: 'colocated_tester',
            email: 'colocated@test.com',
            password_hash: 'secure_hash'
        };

        const createdUser = await User.create(userData);
        const retrievedUser = await User.findByPk(createdUser.id);

        expect(retrievedUser).not.toBeNull();
        expect(retrievedUser.username).toBe('colocated_tester');
        expect(retrievedUser.elo_rating).toBe(1200);
    });

    it('No debe permitir duplicados de email', async () => {
        const userData = { username: 'user1', email: 'dup@test.com', password_hash: 'h' };
        await User.create(userData);

        await expect(User.create({
            username: 'user2',
            email: 'dup@test.com',
            password_hash: 'h'
        })).rejects.toThrow();
    });
});