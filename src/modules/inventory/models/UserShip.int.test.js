/**
 * Test de Integración: Modelo UserShip
 * Valida la persistencia y la relación con ShipTemplate.
 */
import { sequelize } from '../../../config/db.js';
import { ShipTemplate, UserShip } from '../../../shared/models/index.js';
import { createFullUserContext } from '../../../shared/models/testFactory.js';

describe('UserShip Model Integration (Refactored)', () => {
    let setup;

    beforeAll(async () => {
        await sequelize.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
        await sequelize.sync({ force: true });

        setup = await createFullUserContext('collector', 'col@test.va');
    });

    afterAll(async () => {
        await sequelize.close();
    });

    it('Debe verificar que el barco de usuario está correctamente vinculado a su plantilla', async () => {
        const ship = await UserShip.findByPk(setup.uShip.id, {
            include: [{ model: ShipTemplate }]
        });

        expect(ship.templateSlug).toBe('lancha');
        expect(ship.ShipTemplate).toBeDefined();
        expect(ship.ShipTemplate.baseMaxHp).toBeDefined();
    });
});