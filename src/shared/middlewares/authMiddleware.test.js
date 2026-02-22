/**
 * Test Unitario: Middleware de Autenticación.
 * Valida la protección de rutas mediante JWT en un entorno ESM.
 */
import { jest } from '@jest/globals';
import jwt from 'jsonwebtoken';

// Mockeamos el archivo físico del modelo, que es lo que importa el middleware ahora
jest.unstable_mockModule('../../modules/auth/models/User.js', () => ({
    default: {
        findOne: jest.fn()
    }
}));

// Importaciones dinámicas para respetar el orden de los mocks en ESM
const { protect } = await import('./authMiddleware.js');
const User = (await import('../../modules/auth/models/User.js')).default;

describe('AuthMiddleware Unit Tests', () => {
    let req, res, next;
    const TEST_SECRET = 'super_secret_test_key_123';

    beforeEach(() => {
        process.env.JWT_SECRET = TEST_SECRET;
        req = { headers: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        next = jest.fn();
        jest.clearAllMocks();
    });

    it('Debe llamar a next() si el token es válido y el usuario existe', async () => {
        const token = jwt.sign({ email: 'test@bomba.va' }, TEST_SECRET);
        req.headers.authorization = `Bearer ${token}`;

        User.findOne.mockResolvedValue({ id: 'u1', email: 'test@bomba.va' });

        await protect(req, res, next);

        expect(User.findOne).toHaveBeenCalled();
        expect(next).toHaveBeenCalled();
    });

    it('Debe devolver 401 si el token no está presente', async () => {
        await protect(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: expect.stringContaining('no hay token')
        }));
    });

    it('Debe devolver 401 si el token es inválido', async () => {
        req.headers.authorization = 'Bearer token_inventado';

        await protect(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: expect.stringContaining('Token no válido')
        }));
    });
});