/**
 * User Persistence Integration Test
 * Objetivo: Validar la comunicacion real con PostgreSQL.
 */
import { User, sequelize } from '../../src/shared/models/index.js';

describe('User Persistence (Integration)', () => {

    // antes de los tests, aseguramos que la DB este limpia
    beforeAll(async () => {
        await sequelize.sync({ force: true });
    });

    // tras cada test: limpiar tablas específicas si fuera necesario
    afterEach(async () => {
        await User.destroy({ where: {} });
    });

    // cerrar conexion al final
    afterAll(async () => {
        await sequelize.close();
    });

    it('Debe persistir un usuario y recuperarlo con su ELO por defecto', async () => {
        const userData = {
            username: 'tester_pro',
            email: 'test@unizar.es',
            password_hash: 'secret_hash'
        };

        const createdUser = await User.create(userData);
        const retrievedUser = await User.findByPk(createdUser.id);

        expect(retrievedUser).not.toBeNull();
        expect(retrievedUser.username).toBe('tester_pro');
        expect(retrievedUser.elo_rating).toBe(1200);
        expect(retrievedUser.id).toBeDefined();
    });

    it('No debe permitir crear dos usuarios con el mismo email (Unique Constraint)', async () => {
        const userData = {
            username: 'user1',
            email: 'same@unizar.es',
            password_hash: 'hash'
        };

        await User.create(userData);

        await expect(User.create({
            username: 'user2',
            email: 'same@unizar.es',
            password_hash: 'hash'
        })).rejects.toThrow();
    });
});