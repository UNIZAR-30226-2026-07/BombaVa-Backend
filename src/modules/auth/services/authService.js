/**
 * Servicio de Autenticación
 * Contiene la lógica de cifrado, verificación de contraseñas y gestión de JWT.
 */
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import UserDao from '../dao/UserDao.js';

/**
 * Cifra una contraseña en texto plano
 * @param {string} contrasena - Texto plano
 */
export const cifrarContrasena = async (contrasena) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(contrasena, salt);
};

/**
 * Compara una contraseña con su hash guardado
 * @param {string} contrasena - Texto plano
 * @param {string} hash - Hash de la base de datos
 */
export const verificarContrasena = async (contrasena, hash) => {
    return await bcrypt.compare(contrasena, hash);
};

/**
 * Genera un token JWT firmado para un usuario
 * @param {Object} usuario - Instancia del usuario
 */
export const generarTokenAcceso = (usuario) => {
    const payload = {
        id: usuario.id,
        nombreUsuario: usuario.username,
        email: usuario.email
    };
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });
};

/**
 * Lógica de orquestación para el registro de nuevos usuarios
 * @param {Object} datos - Datos del formulario de registro
 */
export const registrarNuevoUsuario = async (datos) => {
    const password_hash = await cifrarContrasena(datos.contrasena);
    return await UserDao.createUser({
        username: datos.username,
        email: datos.email,
        password_hash
    });
};