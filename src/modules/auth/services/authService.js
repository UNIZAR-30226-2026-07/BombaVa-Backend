import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import UserDao from '../dao/UserDao.js';

/**
 * Lógica de seguridad y generación de credenciales
 */

export const cifrarContrasena = async (contrasena) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(contrasena, salt);
};

export const verificarContrasena = async (contrasena, hash) => {
    return await bcrypt.compare(contrasena, hash);
};

export const generarTokenAcceso = (usuario) => {
    const payload = { nombreUsuario: usuario.username, email: usuario.email };
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });
};

export const registrarNuevoUsuario = async (datos) => {
    const password_hash = await cifrarContrasena(datos.contrasena);
    return await UserDao.createUser({
        username: datos.username,
        email: datos.email,
        password_hash
    });
};