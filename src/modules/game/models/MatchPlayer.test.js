/**
 * Test Unitario: Modelo MatchPlayer
 */
import MatchPlayer from './MatchPlayer.js';

describe('MatchPlayer Model Unit Tests', () => {
    it('Debe tener recursos iniciales correctos según GAME_RULES V1', () => {
        expect(MatchPlayer.rawAttributes.fuelReserve.defaultValue).toBe(10);
        expect(MatchPlayer.rawAttributes.ammoCurrent.defaultValue).toBe(5);
    });

    it('No debe permitir combustible negativo', async () => {
        const mp = MatchPlayer.build({ side: 'NORTH', fuelReserve: -5 });
        try {
            await mp.validate();
        } catch (err) {
            const paths = err.errors.map(e => e.path);
            expect(paths).toContain('fuelReserve');
        }
    });
});