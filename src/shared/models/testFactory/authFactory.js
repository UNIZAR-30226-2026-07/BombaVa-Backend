/**
 * Factoría de Autenticación para pruebas.
 */
import { authService } from '../../../modules/auth/index.js';
import User from '../../../modules/auth/models/User.js';

/**
 * Crea un usuario con contraseña cifrada válida para login.
 */
export const createUser = async (username, email) => {
    const password_hash = await authService.cifrarContrasena('test_password');
    const [user] = await User.findOrCreate({
        where: { email },
        defaults: { username, password_hash }
    });
    return user;
};