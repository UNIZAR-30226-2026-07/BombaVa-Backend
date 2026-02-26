/**
 * Test Unitario: Servicio de Autenticación
 * Centraliza las pruebas de lógica de seguridad y generación de credenciales.
 */
import jwt from 'jsonwebtoken';
import { cifrarContrasena, generarTokenAcceso, verificarContrasena } from './authService.js';

describe('AuthService Unit Tests (Refactorizado)', () => {

    it('Debe generar un JWT válido con el payload correcto (id, username, email)', () => {
        const user = { id: 'uuid-123', username: 'raul_test', email: 'raul@test.com' };
        const token = generarTokenAcceso(user);

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        expect(decoded.nombreUsuario).toBe(user.username);
        expect(decoded.email).toBe(user.email);
        expect(decoded.id).toBe(user.id);
    });

    it('Debe cifrar contraseñas de forma asíncrona y segura', async () => {
        const pass = 'password123';
        const hash = await cifrarContrasena(pass);

        expect(hash).not.toBe(pass);
        const match = await verificarContrasena(pass, hash);
        expect(match).toBe(true);
    });

    it('Debe fallar al verificar contraseñas incorrectas', async () => {
        const hash = await cifrarContrasena('correcta');
        const match = await verificarContrasena('incorrecta', hash);
        expect(match).toBe(false);
    });
});