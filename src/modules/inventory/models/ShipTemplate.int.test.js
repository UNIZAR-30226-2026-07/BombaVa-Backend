/**
 * Test de Integración: Modelo ShipTemplate
 * Valida que las plantillas base se persistan correctamente.
 */
import { sequelize } from '../../../config/db.js';
import { createTemplate } from '../../../shared/models/testFactory.js';
import ShipTemplate from './ShipTemplate.js';

describe('ShipTemplate Model Integration (Refactored)', () => {
    beforeAll(async () => {
        await sequelize.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
        await sequelize.sync({ force: true });
    });

    afterAll(async () => {
        await sequelize.close();
    });

    it('Debe persistir una plantilla de acorazado con sus dimensiones V1', async () => {
        await createTemplate('acorazado', { width: 5, baseMaxHp: 50 });

        const template = await ShipTemplate.findByPk('acorazado');

        expect(template.name).toBe('Acorazado');
        expect(template.width).toBe(5);
        expect(template.baseMaxHp).toBe(50);
    });

    it('Debe devolver los valores por defecto si no se especifican overrides', async () => {
        await createTemplate('corbeta');
        const template = await ShipTemplate.findByPk('corbeta');

        expect(template.width).toBe(1);
        expect(template.height).toBe(1);
    });
});