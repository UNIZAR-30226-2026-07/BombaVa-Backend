import { jest } from '@jest/globals';

const transaccionMock = {
    commit: jest.fn().mockResolvedValue(true),
    rollback: jest.fn().mockResolvedValue(true)
};

jest.unstable_mockModule('../../../config/db.js', () => ({
    sequelize: {
        define: jest.fn(() => ({
            hasMany: jest.fn(),
            belongsTo: jest.fn(),
            sync: jest.fn()
        })),
        transaction: jest.fn(async () => transaccionMock)
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
    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });

    it('Should activate a specific deck and deactivate all others correctly', async () => {
        const mazoMock = {
            id: 'd1',
            isActive: false,
            save: jest.fn().mockResolvedValue(true)
        };

        FleetDeck.findOne.mockResolvedValue(mazoMock);
        FleetDeck.update.mockResolvedValue([1]);

        const resultado = await InventoryDao.activateDeck('d1', 'u1');

        expect(mazoMock.isActive).toBe(true);
        expect(mazoMock.save).toHaveBeenCalledWith(expect.objectContaining({ transaction: transaccionMock }));
        expect(transaccionMock.commit).toHaveBeenCalled();
        expect(resultado.id).toBe('d1');
    });

    it('Should return null and rollback if the deck to activate does not exist', async () => {
        FleetDeck.findOne.mockResolvedValue(null);

        const resultado = await InventoryDao.activateDeck('d99', 'u1');

        expect(resultado).toBeNull();
        expect(transaccionMock.rollback).toHaveBeenCalled();
        expect(transaccionMock.commit).not.toHaveBeenCalled();
    });
});