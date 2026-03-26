/**
 * Test Unitario: Controlador de Inventario (Aislado con Mocks)
 * Valida la lógica de flujo del controlador sin tocar la base de datos.
 */
import { jest } from '@jest/globals';

// Actualizamos los mocks con los nuevos métodos que usa el controlador
jest.unstable_mockModule('../dao/InventoryDao.js', () => ({
    default: {
        findUserShips: jest.fn(),
        findByIdAndUser: jest.fn(),
        addWeaponToShip: jest.fn(),
        findByIdWithWeapons: jest.fn()
    }
}));

jest.unstable_mockModule('../dao/WeaponTemplateDao.js', () => ({
    default: {
        findBySlug: jest.fn(),
        findAll: jest.fn()
    }
}));

const { getMyShips, equipWeapon } = await import('./inventoryController.js');
const InventoryDao = (await import('../dao/InventoryDao.js')).default;
const WeaponTemplateDao = (await import('../dao/WeaponTemplateDao.js')).default;

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
        req.body.weaponSlug = 'cannon-base';
        InventoryDao.findByIdAndUser.mockResolvedValue(null);

        await equipWeapon(req, res, next);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: 'Barco no encontrado'
        }));
    });

    it('equipWeapon - Debe devolver 404 si el arma no existe', async () => {
        req.params.shipId = 's1';
        req.body.weaponSlug = 'arma-falsa';
        
        InventoryDao.findByIdAndUser.mockResolvedValue({ id: 's1' });
        WeaponTemplateDao.findBySlug.mockResolvedValue(null); // Arma no encontrada

        await equipWeapon(req, res, next);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: 'Arma no encontrada'
        }));
    });

    it('equipWeapon - Debe devolver 200 y el barco con armas si todo es correcto', async () => {
        const ship = { id: 's1' };
        const shipWithWeapons = { id: 's1', WeaponTemplates: [{ slug: 'cannon-base' }] };
        
        req.params.shipId = 's1';
        req.body.weaponSlug = 'cannon-base';

        InventoryDao.findByIdAndUser.mockResolvedValue(ship);
        WeaponTemplateDao.findBySlug.mockResolvedValue({ slug: 'cannon-base' });
        InventoryDao.addWeaponToShip.mockResolvedValue();
        InventoryDao.findByIdWithWeapons.mockResolvedValue(shipWithWeapons);

        await equipWeapon(req, res, next);

        expect(InventoryDao.addWeaponToShip).toHaveBeenCalledWith(ship, 'cannon-base');
        expect(res.json).toHaveBeenCalledWith(shipWithWeapons);
    });
});