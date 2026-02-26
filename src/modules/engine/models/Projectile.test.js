import Projectile from './Projectile.js';

describe('Projectile Model Exhaustive Tests', () => {
    const dummyMatchId = '550e8400-e29b-41d4-a716-446655440000';
    const dummyOwnerId = '550e8400-e29b-41d4-a716-446655440001';

    it('Debe fallar si el tipo de proyectil no es TORPEDO ni MINE', async () => {
        const p = Projectile.build({
            matchId: dummyMatchId,
            ownerId: dummyOwnerId,
            type: 'NUKE',
            x: 0,
            y: 0,
            lifeDistance: 1
        });

        try {
            await p.validate();
            fail('Debería haber fallado por tipo de proyectil inválido');
        } catch (err) {
            expect(err.name).toBe('SequelizeValidationError');
            const hasTypeError = err.errors.some(e => e.path === 'type');
            expect(hasTypeError).toBe(true);
        }
    });

    it('Debe permitir lifeDistance 0 (mina a punto de explotar)', async () => {
        const p = Projectile.build({
            matchId: dummyMatchId,
            ownerId: dummyOwnerId,
            type: 'MINE',
            x: 0,
            y: 0,
            lifeDistance: 0,
            vectorX: 0,
            vectorY: 0
        });
        await expect(p.validate()).resolves.not.toThrow();
    });
});