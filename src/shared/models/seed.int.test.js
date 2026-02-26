/**
 * Test de Integración: Smoke Test del Seeder.
 * Valida que el proceso de población de datos sea exitoso y respete las FK.
 */
import { sequelize } from '../../config/index.js';
import { FleetDeck, User, UserShip } from './index.js';
import runSeeder from './seed.js';

describe('Database Seeder Smoke Test (Reliability)', () => {

    beforeAll(async () => {
        await sequelize.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
        await sequelize.sync({ force: true });
    });

    afterAll(async () => {
        await sequelize.close();
    });

    it('Debe ejecutar el seeding completo sin errores de integridad (Code 0 Path)', async () => {
        await expect(runSeeder()).resolves.not.toThrow();

        const user = await User.findOne({ where: { username: 'raul_lead' } });
        expect(user).not.toBeNull();

        const ship = await UserShip.findOne({ where: { userId: user.id } });
        expect(ship).not.toBeNull();

        const deck = await FleetDeck.findOne({ where: { userId: user.id } });
        expect(deck.isActive).toBe(true);
    });

    it('Debe ser idempotente (poder ejecutarse dos veces sin fallar)', async () => {
        await expect(runSeeder()).resolves.not.toThrow();
    });
});