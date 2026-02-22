/**
 * Test Unitario: Middleware de Autenticación
 * Valida que el sistema bloquee o permita el paso según la validez del token JWT.
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
    const SECRET = 'test_secret_key_123';

    beforeEach(() => {
        process.env.JWT_SECRET = SECRET;
        req = { headers: {} };
        res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        next = jest.fn();
        jest.clearAllMocks();
    });

    it('Debe devolver 401 si no hay cabecera Authorization', async () => {
        await protect(req, res, next);
        expect(res.status).toHaveBeenCalledWith(401);
    });

    it('Debe llamar a next() si el token es válido y el usuario existe', async () => {
        const token = jwt.sign({ email: 'test@bomba.va' }, SECRET);
        req.headers.authorization = `Bearer ${token}`;

        User.findOne.mockResolvedValue({ id: 'uuid-1', email: 'test@bomba.va' });

        await protect(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(req.user).toBeDefined();
    });

    it('Debe devolver 401 si el token es inválido', async () => {
        req.headers.authorization = 'Bearer token-falso';
        await protect(req, res, next);
        expect(res.status).toHaveBeenCalledWith(401);
    });
});