/**
 * Test de Integración: DAO de Plantillas de Armamento
 * Valida la lógica de negocio de las weapon templates.
 */

import { sequelize } from '../../../config/db.js';
import { createFullUserContext } from '../../../shared/models/testFactory.js';
import { initDefaults } from '../../../shared/models/bootstrap.js';
import InventoryDao from './InventoryDao.js';
import WeaponTemplateDao from './WeaponTemplateDao.js';

describe('Weapon & Inventory DAO Integration', () => {
    let setup;

    beforeAll(async () => {
        await sequelize.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
        await sequelize.sync({ force: true });
        await initDefaults(); // Carga las armas base (cannon-base, etc)
        setup = await createFullUserContext('dao_weapon_tester', 'dao@weapon.va');
    });

    afterAll(async () => {
        await sequelize.close();
    });

    it('WeaponTemplateDao - Debe listar las armas cargadas por el bootstrap', async () => {
        const weapons = await WeaponTemplateDao.findAll();
        expect(weapons.length).toBeGreaterThan(0);
        expect(weapons.map(w => w.slug)).toContain('cannon-base');
    });

    it('InventoryDao - Debe permitir equipar múltiples armas a un barco', async () => {
        const ship = setup.uShip;
        
        // Equipamos cañón y torpedo
        await InventoryDao.addWeaponToShip(ship, 'cannon-base');
        await InventoryDao.addWeaponToShip(ship, 'torpedo-v1');

        const shipWithWeapons = await InventoryDao.findByIdWithWeapons(ship.id, setup.user.id);
        
        expect(shipWithWeapons.WeaponTemplates).toHaveLength(5);
        const slugs = shipWithWeapons.WeaponTemplates.map(w => w.slug);
        expect(slugs).toContain('cannon-base');
        expect(slugs).toContain('torpedo-v1');
    });
});
