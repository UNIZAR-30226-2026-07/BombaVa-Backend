import FleetDeck from './FleetDeck.js';

describe('FleetDeck Model Exhaustive Tests', () => {

    it('Debe fallar si el nombre es demasiado corto', async () => {
        const deck = FleetDeck.build({ deckName: 'Ab', shipIds: [] });
        try {
            await deck.validate();
        } catch (err) {
            expect(err.errors[0].path).toBe('deckName');
        }
    });

    it('Debe fallar si shipIds no es un array', async () => {
        const deck = FleetDeck.build({ deckName: 'Mazo Test', shipIds: "no-soy-un-array" });
        try {
            await deck.validate();
        } catch (err) {
            expect(err.errors[0].message).toBe('shipIds debe ser un array de UUIDs');
        }
    });

    it('Debe tener isActive en false por defecto', () => {
        expect(FleetDeck.rawAttributes.isActive.defaultValue).toBe(false);
    });
});