import Match from './Match.js';

describe('Match Model Unit Tests', () => {
    it('Debe inicializarse en estado WAITING y turno 1', () => {
        expect(Match.rawAttributes.status.defaultValue).toBe('WAITING');
        expect(Match.rawAttributes.turnNumber.defaultValue).toBe(1);
    });

    it('Debe fallar si el estado no es válido', async () => {
        const match = Match.build({
            status: 'HACKED_STATE',
            mapTerrain: { size: 15 }
        });
        try {
            await match.validate();
        } catch (err) {
            expect(err.name).toBe('SequelizeValidationError');
        }
    });

    it('Debe requerir un mapa de terreno', async () => {
        const match = Match.build({ status: 'PLAYING' });
        try {
            await match.validate();
        } catch (err) {
            expect(err.errors.map(e => e.path)).toContain('mapTerrain');
        }
    });
});