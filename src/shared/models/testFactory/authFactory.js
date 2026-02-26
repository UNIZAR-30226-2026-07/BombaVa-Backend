/**
 * Factoría de Autenticación para pruebas.
 */
import User from '../../../modules/auth/models/User.js';
import * as authService from '../../../modules/auth/services/authService.js';

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