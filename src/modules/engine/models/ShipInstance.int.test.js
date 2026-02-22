/**
 * Test de Integración: Modelo ShipInstance
 */
import { sequelize } from '../../../config/db.js';
import { createMatchWithInstance } from '../../../shared/models/testFactory.js';
import ShipInstance from './ShipInstance.js';

describe('ShipInstance Persistence Integration (Refactored)', () => {
    let setup;

    beforeAll(async () => {
        await sequelize.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
        await sequelize.sync({ force: true });

        setup = await createMatchWithInstance('captain_dao', 'c@dao.va', { x: 10, y: 10 });
    });

    afterAll(async () => {
        await sequelize.close();
    });

    it('Debe recuperar la instancia de barco con sus coordenadas y orientación correctas', async () => {
        const ship = await ShipInstance.findByPk(setup.instance.id);

        expect(ship.x).toBe(10);
        expect(ship.y).toBe(10);
        expect(ship.orientation).toBe('N');
        expect(ship.playerId).toBe(setup.user.id);
    });
});