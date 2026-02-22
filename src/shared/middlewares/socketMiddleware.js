/**
 * Middleware de autenticación para conexiones WebSocket.
 * Verifica el token JWT y vincula los datos del usuario al socket.
 * 
 * @param {Object} socket - Instancia del socket que intenta conectar.
 * @param {Function} next - Función para permitir o denegar la conexión.
 */
import jwt from 'jsonwebtoken';
import User from '../../modules/auth/models/User.js';

export const socketProtect = async (socket, next) => {
    const token = socket.handshake.auth?.token;

    if (!token) {
        return next(new Error('No autorizado, falta token'));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({
            where: { email: decoded.email },
            attributes: { exclude: ['password_hash'] }
        });

        if (!user) {
            return next(new Error('Usuario no encontrado'));
        }

        socket.data.user = user;
        next();
    } catch (error) {
        next(new Error('Token no válido o expirado'));
    }
};