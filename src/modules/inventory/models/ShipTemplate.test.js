import ShipTemplate from './ShipTemplate.js';

describe('ShipTemplate Model Unit Tests', () => {

    it('Debe requerir un slug y un nombre', async () => {
        const template = ShipTemplate.build({});
        try {
            await template.validate();
        } catch (err) {
            const paths = err.errors.map(e => e.path);
            expect(paths).toContain('slug');
            expect(paths).toContain('name');
        }
    });

    it('Debe tener definidos dimensiones de 1x1 por defecto en el esquema', () => {
        expect(ShipTemplate.rawAttributes.width.defaultValue).toBe(1);
        expect(ShipTemplate.rawAttributes.height.defaultValue).toBe(1);
    });

    it('Debe inicializar baseStats como un objeto vacío por defecto en el esquema', () => {
        expect(ShipTemplate.rawAttributes.baseStats.defaultValue).toEqual({});
    });

    it('Debe fallar si las dimensiones son menores a 1', async () => {
        const template = ShipTemplate.build({
            slug: 'error',
            name: 'Error',
            width: 0,
            baseMaxHp: 10,
            supplyCost: 1
        });
        try {
            await template.validate();
        } catch (err) {
            expect(err.errors[0].path).toBe('width');
        }
    });
});

describe('ShipTemplate Unit Validations', () => {
    it('Debe fallar si el ancho (width) es menor a 1', async () => {
        const template = ShipTemplate.build({
            slug: 'error',
            name: 'Error',
            width: 0,
            baseMaxHp: 10,
            supplyCost: 5
        });

        try {
            await template.validate();
        } catch (err) {
            const hasWidthError = err.errors.some(e => e.path === 'width');
            expect(hasWidthError).toBe(true);
        }
    });
});