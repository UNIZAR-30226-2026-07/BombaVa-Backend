import UserShip from './UserShip.js';

describe('UserShip Model Exhaustive Tests', () => {
    const dummyUserId = '550e8400-e29b-41d4-a716-446655440000';
    const dummyTemplate = 'lancha';

    it('Debe tener nivel 1 por defecto en el esquema', () => {
        expect(UserShip.rawAttributes.level.defaultValue).toBe(1);
    });

    it('Debe fallar si el nivel es menor a 1', async () => {
        const ship = UserShip.build({
            userId: dummyUserId,
            templateSlug: dummyTemplate,
            level: 0
        });
        try {
            await ship.validate();
            fail('Debería haber fallado por nivel insuficiente');
        } catch (err) {
            expect(err.name).toBe('SequelizeValidationError');
            const hasError = err.errors.some(e => e.path === 'level');
            expect(hasError).toBe(true);
        }
    });

    it('Debe inicializar customStats como un objeto vacío por defecto', () => {
        expect(UserShip.rawAttributes.customStats.defaultValue).toEqual({});
    });

    it('Debe permitir guardar configuraciones JSON complejas en customStats', async () => {
        const stats = { engine: 'Nuclear', skins: ['Gold'], damageBonus: 1.5 };
        const ship = UserShip.build({
            userId: dummyUserId,
            templateSlug: dummyTemplate,
            level: 5,
            customStats: stats
        });

        await expect(ship.validate()).resolves.not.toThrow();
        expect(ship.customStats.engine).toBe('Nuclear');
    });
});