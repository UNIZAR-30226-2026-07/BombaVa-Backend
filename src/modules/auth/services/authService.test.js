import jwt from 'jsonwebtoken';
import { generarTokenAcceso } from './authService.js';

describe('AuthService Unit Tests (Security Logic)', () => {

    it('Should generate a valid JWT token with user information', () => {
        const user = { username: 'test_user', email: 'test@bomba.va' };
        const token = generarTokenAcceso(user);

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        expect(decoded.nombreUsuario).toBe(user.username);
        expect(decoded.email).toBe(user.email);
    });
});