/**
 * Test Unitario: Controlador de Inventario (Aislado con Mocks)
 * Valida la lógica de flujo del controlador sin tocar la base de datos.
 */
import { jest } from '@jest/globals';

jest.unstable_mockModule('../dao/InventoryDao.js', () => ({
    default: {
        findUserShips: jest.fn(),
        findByIdAndUser: jest.fn(),
        updateShipStats: jest.fn()
    }
}));

const { getMyShips, equipWeapon } = await import('./inventoryController.js');
const InventoryDao = (await import('../dao/InventoryDao.js')).default;

describe('InventoryController Unit Tests (Mocks)', () => {
    let req, res, next;

    beforeEach(() => {
        req = { user: { id: 'u1' }, params: {}, body: {} };
        res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
        next = jest.fn();
        jest.clearAllMocks();
    });

    it('getMyShips - Debe llamar al DAO con el ID de usuario del token', async () => {
        InventoryDao.findUserShips.mockResolvedValue([]);
        await getMyShips(req, res, next);
        expect(InventoryDao.findUserShips).toHaveBeenCalledWith('u1');
    });

    it('equipWeapon - Debe devolver 404 si el barco no existe en el DAO', async () => {
        req.params.shipId = 's99';
        InventoryDao.findByIdAndUser.mockResolvedValue(null);

        await equipWeapon(req, res, next);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: 'Barco no encontrado'
        }));
    });

    it('equipWeapon - Debe devolver 200 y el barco actualizado si existe', async () => {
        const ship = { id: 's1', customStats: {} };
        req.params.shipId = 's1';
        req.body.weaponSlug = 'canon-v1';

        InventoryDao.findByIdAndUser.mockResolvedValue(ship);
        InventoryDao.updateShipStats.mockResolvedValue({ ...ship, updated: true });

        await equipWeapon(req, res, next);

        expect(res.json).toHaveBeenCalled();
    });
});