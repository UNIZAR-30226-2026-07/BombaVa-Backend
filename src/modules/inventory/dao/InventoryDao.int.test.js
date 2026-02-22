/**
 * Test de Integración: DAO de Inventario
 * Valida la lógica transaccional de activación de mazos.
 */
import { sequelize } from '../../../config/db.js';
import FleetDeck from '../models/FleetDeck.js';
import InventoryDao from './InventoryDao.js';

describe('InventoryDao Integration (Colocated)', () => {
    const userId = '550e8400-e29b-41d4-a716-446655440000';

    beforeAll(async () => {
        await sequelize.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
        await sequelize.sync({ force: true });
    });

    afterAll(async () => {
        await sequelize.close();
    });

    it('activateDeck - Debe activar uno y desactivar los demás del usuario', async () => {
        const d1 = await FleetDeck.create({ userId, deckName: 'Mazo 1', shipIds: [], isActive: true });
        const d2 = await FleetDeck.create({ userId, deckName: 'Mazo 2', shipIds: [], isActive: false });

        await InventoryDao.activateDeck(d2.id, userId);

        const checkD1 = await FleetDeck.findByPk(d1.id);
        const checkD2 = await FleetDeck.findByPk(d2.id);

        expect(checkD1.isActive).toBe(false);
        expect(checkD2.isActive).toBe(true);
    });
});