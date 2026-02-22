/**
 * Test de Integración: Modelo Projectile
 * Valida la persistencia física de torpedos y minas vinculados a una partida real.
 */
import { sequelize } from '../../../config/db.js';
import { createMatchWithInstance } from '../../../shared/models/testFactory.js';
import Projectile from './Projectile.js';

describe('Projectile Model Integration (Refactored)', () => {
    let setup;

    beforeAll(async () => {
        await sequelize.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
        await sequelize.sync({ force: true });

        setup = await createMatchWithInstance('owner_test', 'o@t.com');
    });

    afterAll(async () => {
        await sequelize.close();
    });

    it('Debe persistir un torpedo vinculado a un dueño y partida existentes', async () => {
        const p = await Projectile.create({
            matchId: setup.match.id,
            ownerId: setup.user.id,
            type: 'TORPEDO',
            x: setup.instance.x,
            y: setup.instance.y - 1,
            vectorX: 0,
            vectorY: -1,
            lifeDistance: 6
        });

        expect(p.id).toBeDefined();
        expect(p.matchId).toBe(setup.match.id);
        expect(p.ownerId).toBe(setup.user.id);
    });
});