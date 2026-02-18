import MatchPlayer from './MatchPlayer.js';

describe('MatchPlayer Model Unit Tests', () => {
    it('Debe tener recursos iniciales correctos', () => {
        expect(MatchPlayer.rawAttributes.fuelReserve.defaultValue).toBe(100);
        expect(MatchPlayer.rawAttributes.ammoCurrent.defaultValue).toBe(10);
    });

    it('Debe fallar si el bando (side) no es NORTH o SOUTH', async () => {
        const mp = MatchPlayer.build({ side: 'EAST' });
        try {
            await mp.validate();
        } catch (err) {
            expect(err.name).toBe('SequelizeValidationError');
        }
    });

    it('No debe permitir combustible negativo', async () => {
        const mp = MatchPlayer.build({ side: 'NORTH', fuelReserve: -5 });
        try {
            await mp.validate();
        } catch (err) {
            expect(err.errors.map(e => e.path)).toContain('fuelReserve');
        }
    });
});