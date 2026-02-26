/**
 * Test de Integración: Modelo FleetDeck
 */
import { sequelize } from '../../../config/db.js';
import { createFullUserContext } from '../../../shared/models/testFactory.js';
import FleetDeck from './FleetDeck.js';

describe('FleetDeck Model Integration (Refactored)', () => {
    let setup;

    beforeAll(async () => {
        await sequelize.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
        await sequelize.sync({ force: true });

        setup = await createFullUserContext('designer', 'des@test.va');
    });

    afterAll(async () => {
        await sequelize.close();
    });

    it('Debe permitir crear un mazo adicional para el usuario de la factoría', async () => {
        const deck = await FleetDeck.create({
            userId: setup.user.id,
            deckName: 'Mazo de Pruebas',
            shipIds: [{
                userShipId: setup.uShip.id,
                position: { x: 1, y: 1 },
                orientation: 'S'
            }],
            isActive: false
        });

        expect(deck.id).toBeDefined();
        expect(deck.userId).toBe(setup.user.id);
    });
});