/**
 * Test Unitario: Validación de Plantilla
 */
import ShipTemplate from './ShipTemplate.js';

describe('ShipTemplate Unit Validations', () => {
    it('Debe fallar si las dimensiones son menores a 1x1', async () => {
        const template = ShipTemplate.build({
            slug: 'error',
            name: 'Error',
            width: 0,
            height: 1
        });

        await expect(template.validate()).rejects.toThrow();
    });

    it('Debe aceptar plantillas estándar de la V1', async () => {
        const template = ShipTemplate.build({
            slug: 'lancha',
            name: 'Lancha',
            width: 1,
            height: 1,
            baseMaxHp: 10,
            supplyCost: 5
        });

        await expect(template.validate()).resolves.not.toThrow();
    });
});