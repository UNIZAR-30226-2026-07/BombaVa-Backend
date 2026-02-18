import ShipInstance from './ShipInstance.js';

describe('ShipInstance Model Unit Tests', () => {

    it('Debe fallar si la orientación no es N, S, E o W', async () => {
        const ship = ShipInstance.build({
            x: 5,
            y: 5,
            orientation: 'X', // No existe la orientacion X
            currentHp: 100
        });

        try {
            await ship.validate();
        } catch (err) {
            expect(err.name).toBe('SequelizeValidationError');
            expect(err.errors[0].path).toBe('orientation');
        }
    });

    it('Debe inicializarse con isSunk en false por defecto', () => {
        const ship = ShipInstance.build({
            x: 0,
            y: 0,
            orientation: 'N',
            currentHp: 50
        });
        expect(ship.isSunk).toBe(false);
    });

    it('Debe requerir coordenadas x e y', async () => {
        const ship = ShipInstance.build({
            orientation: 'N',
            currentHp: 10
        });

        try {
            await ship.validate();
        } catch (err) {
            const paths = err.errors.map(e => e.path);
            expect(paths).toContain('x');
            expect(paths).toContain('y');
        }
    });
});