/**
 * Prueba de que la BBDD arranca con datos por defecto
 * que debería de tener en cualquier momento
 */
import { sequelize } from '../../config/index.js';
import { ShipTemplate } from './index.js';
import { initDefaults } from './bootstrap.js';

describe('Prueba de constantes en BBDD', () => {

    beforeAll(async () => {
        await sequelize.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
        await sequelize.sync({ force: true });
    });

    afterAll(async () => {
        await sequelize.close();
    });

    it('Los datos por defecto deberían de ser añadidas en la BBDD', async () => {
        await expect(initDefaults()).resolves.not.toThrow();

        const ship1 = await ShipTemplate.findOne({ where: {slug: 'lancha'}})
        expect(ship1).not.toBeNull();

        const ship2 = await ShipTemplate.findOne({ where: {slug: 'fragata'}})
        expect(ship2).not.toBeNull();

        const ship3 = await ShipTemplate.findOne({ where: {slug: 'acorazado'}})
        expect(ship3).not.toBeNull();
    });

    it('Se vuelve a ejecutar para asegurarnos de que no falla (comprueba que ya esta y no dbería de volver a añadirla)', async () => {
        await expect(initDefaults()).resolves.not.toThrow();
    });
});