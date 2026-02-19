import jwt from 'jsonwebtoken';
import { generateToken } from './authController.js';

describe('Auth Controller Unit Utils', () => {
    it('Debe generar un JWT válido con el payload correcto', () => {
        const user = { username: 'raul_test', email: 'raul@test.com' };
        const token = generateToken(user.username, user.email);

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        expect(decoded.nombreUsuario).toBe(user.username);
        expect(decoded.email).toBe(user.email);
    });
});