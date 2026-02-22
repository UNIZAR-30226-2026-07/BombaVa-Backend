/**
 * Test Unitario: Middleware de Autenticación
 */
import { jest } from '@jest/globals';
import jwt from 'jsonwebtoken';

jest.unstable_mockModule('../../modules/auth/models/User.js', () => ({
    default: { findOne: jest.fn() }
}));

const { protect } = await import('./authMiddleware.js');
const User = (await import('../../modules/auth/models/User.js')).default;

describe('AuthMiddleware Unit Tests', () => {
    let req, res, next;
    const TEST_SECRET = 'super_secret_test_key';

    beforeEach(() => {
        process.env.JWT_SECRET = TEST_SECRET;
        req = { headers: {} };
        res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        next = jest.fn();
        jest.clearAllMocks();
    });

    it('Debe llamar a next() si el token es válido y el usuario existe en DB', async () => {
        const token = jwt.sign({ email: 'valid@test.com' }, TEST_SECRET);
        req.headers.authorization = `Bearer ${token}`;

        User.findOne.mockResolvedValue({ id: 'u1', email: 'valid@test.com' });

        await protect(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(req.user).toBeDefined();
    });

    it('Debe devolver 401 si el token ha sido manipulado', async () => {
        req.headers.authorization = 'Bearer token-inventado';
        await protect(req, res, next);
        expect(res.status).toHaveBeenCalledWith(401);
    });
});