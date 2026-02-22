import { jest } from '@jest/globals';

jest.unstable_mockModule('../dao/InventoryDao.js', () => ({
    default: {
        findUserShips: jest.fn(),
        findByIdAndUser: jest.fn(),
        updateShipStats: jest.fn()
    }
}));

jest.unstable_mockModule('express-validator', () => ({
    validationResult: jest.fn(() => ({
        isEmpty: () => true,
        array: () => []
    }))
}));

const { getMyShips, equipWeapon } = await import('./inventoryController.js');
const InventoryDao = (await import('../dao/InventoryDao.js')).default;

describe('InventoryController Unit Tests', () => {
    let req, res, next;

    beforeEach(() => {
        req = { user: { id: 'u1' }, params: {}, body: {} };
        res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
        next = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('Should return all user ships calling findUserShips from Dao', async () => {
        const shipsMock = [{ id: 's1', templateSlug: 'lancha' }];
        InventoryDao.findUserShips.mockResolvedValue(shipsMock);

        await getMyShips(req, res, next);

        expect(InventoryDao.findUserShips).toHaveBeenCalledWith('u1');
        expect(res.json).toHaveBeenCalledWith(shipsMock);
    });

    it('Should equip a weapon and return the updated ship', async () => {
        req.params.shipId = 's1';
        req.body.weaponSlug = 'cannon-v1';
        const shipMock = { id: 's1', userId: 'u1' };

        InventoryDao.findByIdAndUser.mockResolvedValue(shipMock);
        InventoryDao.updateShipStats.mockResolvedValue({ ...shipMock, customStats: { equippedWeapon: 'cannon-v1' } });

        await equipWeapon(req, res, next);

        expect(InventoryDao.updateShipStats).toHaveBeenCalled();
        expect(res.json).toHaveBeenCalled();
    });

    it('Should return 404 if ship to equip weapon is not found', async () => {
        req.params.shipId = 's99';
        InventoryDao.findByIdAndUser.mockResolvedValue(null);

        await equipWeapon(req, res, next);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: 'Barco no encontrado' });
    });
});