import UserShip from './UserShip.js';

describe('UserShip Model Exhaustive Tests', () => {

    it('Debe tener nivel 1 por defecto en el esquema', () => {
        expect(UserShip.rawAttributes.level.defaultValue).toBe(1);
    });

    it('Debe fallar si el nivel es menor a 1', async () => {
        const ship = UserShip.build({ level: 0 });
        try {
            await ship.validate();
            fail('Debería haber fallado por nivel insuficiente');
        } catch (err) {
            expect(err.name).toBe('SequelizeValidationError');
            expect(err.errors[0].path).toBe('level');
        }
    });

    it('Debe inicializar customStats como un objeto vacío por defecto', () => {
        expect(UserShip.rawAttributes.customStats.defaultValue).toEqual({});
    });

    it('Debe permitir guardar configuraciones JSON complejas en customStats', async () => {
        const stats = { engine: 'Nuclear', skins: ['Gold', 'Battle-Worn'], damageBonus: 1.5 };
        const ship = UserShip.build({
            level: 5,
            customStats: stats
        });

        // Solo validamos en memoria
        await expect(ship.validate()).resolves.not.toThrow();
        expect(ship.customStats.engine).toBe('Nuclear');
    });
});