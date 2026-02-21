import { jest } from '@jest/globals';

jest.unstable_mockModule('../../../config/db.js', () => ({
    sequelize: {
        transaction: jest.fn(() => ({ commit: jest.fn(), rollback: jest.fn() }))
    }
}));

jest.unstable_mockModule('../models/FleetDeck.js', () => ({
    default: {
        update: jest.fn(),
        findOne: jest.fn(),
        create: jest.fn(),
        findAll: jest.fn()
    }
}));

const InventoryDao = (await import('./InventoryDao.js')).default;
const FleetDeck = (await import('../models/FleetDeck.js')).default;

describe('InventoryDao Unit Tests', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('Should activate deck and deactivate others in a transaction', async () => {
        const deckMock = { id: 'd1', isActive: false, save: jest.fn() };
        FleetDeck.findOne.mockResolvedValue(deckMock);

        await InventoryDao.activateDeck('d1', 'u1');

        expect(FleetDeck.update).toHaveBeenCalledWith({ isActive: false }, expect.anything());
        expect(deckMock.isActive).toBe(true);
        expect(deckMock.save).toHaveBeenCalled();
    });
});