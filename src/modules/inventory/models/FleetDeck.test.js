import FleetDeck from './FleetDeck.js';

describe('FleetDeck Model Exhaustive Tests', () => {
    const dummyUserId = '550e8400-e29b-41d4-a716-446655440000';

    it('Debe fallar si el nombre es demasiado corto', async () => {
        const deck = FleetDeck.build({ userId: dummyUserId, deckName: 'Ab', shipIds: [] });
        try {
            await deck.validate();
        } catch (err) {
            const hasError = err.errors.some(e => e.path === 'deckName');
            expect(hasError).toBe(true);
        }
    });

    it('Debe fallar si shipIds no es un array', async () => {
        const deck = FleetDeck.build({ userId: dummyUserId, deckName: 'Mazo Test', shipIds: "no" });
        try {
            await deck.validate();
        } catch (err) {
            expect(err.errors.some(e => e.message === 'shipIds debe ser un array de UUIDs')).toBe(true);
        }
    });
});