import ShipInstance from './ShipInstance.js';

describe('ShipInstance Model Exhaustive Tests', () => {

    it('Debe fallar si la orientación no es una de las cardinales (N,S,E,W)', async () => {
        // Rellenamos el resto de campos para que el único error sea la orientación
        const ship = ShipInstance.build({
            x: 0,
            y: 0,
            orientation: 'Z',
            currentHp: 10
        });

        try {
            await ship.validate();
        } catch (err) {
            // Buscamos si entre todos los errores está el de la orientación
            const hasOrientationError = err.errors.some(e => e.path === 'orientation');
            expect(hasOrientationError).toBe(true);
        }
    });

    it('Debe fallar si faltan campos obligatorios', async () => {
        const ship = ShipInstance.build({});
        try {
            await ship.validate();
        } catch (err) {
            const paths = err.errors.map(e => e.path);
            expect(paths).toContain('x');
            expect(paths).toContain('y');
            expect(paths).toContain('orientation');
        }
    });
});