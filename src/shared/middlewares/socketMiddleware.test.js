/**
 * Test Unitario: Middleware de Sockets
 * Valida la protección de la conexión mediante JWT.
 */
import { jest } from '@jest/globals';
import jwt from 'jsonwebtoken';

jest.unstable_mockModule('../../modules/auth/models/User.js', () => ({
    default: { findOne: jest.fn() }
}));

const { socketProtect } = await import('./socketMiddleware.js');
const User = (await import('../../modules/auth/models/User.js')).default;

describe('SocketMiddleware Unit Tests', () => {
    let socket, next;
    const SECRET = 'test_secret_key';

    beforeEach(() => {
        process.env.JWT_SECRET = SECRET;
        socket = { handshake: { auth: {} }, data: {} };
        next = jest.fn();
        jest.clearAllMocks();
    });

    it('Debe devolver error si no se proporciona token', async () => {
        await socketProtect(socket, next);
        expect(next).toHaveBeenCalledWith(expect.any(Error));
        expect(next.mock.calls[0][0].message).toContain('falta token');
    });

    it('Debe vincular el usuario al socket si el token es válido', async () => {
        const token = jwt.sign({ email: 'socket@test.com' }, SECRET);
        socket.handshake.auth.token = token;

        User.findOne.mockResolvedValue({ id: 'u1', email: 'socket@test.com' });

        await socketProtect(socket, next);

        expect(next).toHaveBeenCalledWith();
        expect(socket.data.user.id).toBe('u1');
    });

    it('Debe fallar si el usuario del token ya no existe', async () => {
        const token = jwt.sign({ email: 'borrado@test.com' }, SECRET);
        socket.handshake.auth.token = token;

        User.findOne.mockResolvedValue(null);

        await socketProtect(socket, next);

        expect(next).toHaveBeenCalledWith(expect.any(Error));
        expect(next.mock.calls[0][0].message).toContain('Usuario no encontrado');
    });
});