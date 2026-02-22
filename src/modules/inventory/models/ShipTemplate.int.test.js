/**
 * Test de Integración: Modelo ShipTemplate
 * Valida que las plantillas base se persistan correctamente.
 */
import { sequelize } from '../../../config/db.js';
import ShipTemplate from './ShipTemplate.js';

describe('ShipTemplate Model Integration (Colocated)', () => {
    beforeAll(async () => {
        await sequelize.sync({ force: true });
    });

    afterAll(async () => {
        await sequelize.close();
    });

    it('Debe persistir una plantilla con sus dimensiones y stats base', async () => {
        const template = await ShipTemplate.create({
            slug: 'acorazado',
            name: 'Acorazado Clase Yamato',
            width: 5,
            height: 1,
            baseMaxHp: 100,
            supplyCost: 50,
            baseStats: { armor: 10, firepower: 20 }
        });

        expect(template.slug).toBe('acorazado');
        expect(template.baseStats.armor).toBe(10);
    });
});