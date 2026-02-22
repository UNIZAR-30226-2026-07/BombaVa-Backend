/**
 * Test de Integración: DAO de Inventario
 * Valida la lógica de negocio de activación de mazos con la factoría.
 */
import { sequelize } from '../../../config/db.js';
import { createFullUserContext } from '../../../shared/models/testFactory.js';
import FleetDeck from '../models/FleetDeck.js';
import InventoryDao from './InventoryDao.js';

describe('InventoryDao Integration (Refactored)', () => {
    let setup;

    beforeAll(async () => {
        await sequelize.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
        await sequelize.sync({ force: true });

        setup = await createFullUserContext('dao_tester', 'dao@test.com');
    });

    afterAll(async () => {
        await sequelize.close();
    });

    it('activateDeck - Debe gestionar correctamente la exclusividad del mazo activo', async () => {
        const secondDeck = await FleetDeck.create({
            userId: setup.user.id,
            deckName: 'Mazo Secundario',
            shipIds: [],
            isActive: false
        });

        await InventoryDao.activateDeck(secondDeck.id, setup.user.id);

        const checkFirst = await FleetDeck.findByPk(setup.deck.id);
        const checkSecond = await FleetDeck.findByPk(secondDeck.id);

        expect(checkFirst.isActive).toBe(false);
        expect(checkSecond.isActive).toBe(true);
    });
});