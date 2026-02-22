/**
 * Test de Integración: Modelo FleetDeck
 * Valida la persistencia de configuraciones de mazo y la integridad del JSONB.
 */
import { sequelize } from '../../../config/db.js';
import User from '../../auth/models/User.js';
import FleetDeck from './FleetDeck.js';

describe('FleetDeck Model Integration (Colocated)', () => {
    let userId;

    beforeAll(async () => {
        await sequelize.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
        await sequelize.sync({ force: true });

        const user = await User.create({
            username: 'deck_designer',
            email: 'designer@test.com',
            password_hash: 'hash123'
        });
        userId = user.id;
    });

    afterAll(async () => {
        await sequelize.close();
    });

    it('Debe persistir un mazo con la estructura de formación V1 correctamente', async () => {
        const formation = [
            {
                userShipId: '550e8400-e29b-41d4-a716-446655440000',
                position: { x: 7, y: 2 },
                orientation: 'N'
            }
        ];

        const deck = await FleetDeck.create({
            userId,
            deckName: 'Flota de Ataque',
            shipIds: formation,
            isActive: true
        });

        const savedDeck = await FleetDeck.findByPk(deck.id);
        expect(savedDeck.deckName).toBe('Flota de Ataque');
        expect(savedDeck.shipIds[0].position.x).toBe(7);
        expect(savedDeck.isActive).toBe(true);
    });

    it('Debe fallar si el nombre del mazo es demasiado corto (Validation)', async () => {
        const deck = FleetDeck.build({
            userId,
            deckName: 'Ab',
            shipIds: []
        });

        await expect(deck.validate()).rejects.toThrow();
    });
});