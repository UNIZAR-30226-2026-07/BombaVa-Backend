/**
 * Middleware que protege rutas verificando el token JWT.
 * 
 * @param {Object} req - Objeto de petición Express.
 * @param {Object} res - Objeto de respuesta Express.
 * @param {Function} next - Función de paso al siguiente middleware.
 */
import jwt from 'jsonwebtoken';
import User from '../../modules/auth/models/User.js';

export const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.user = await User.findOne({
                where: { email: decoded.email },
                attributes: { exclude: ['password_hash'] }
            });

            if (!req.user) {
                return res.status(401).json({ message: 'Usuario no encontrado' });
            }

            return next();
        } catch (error) {
            return res.status(401).json({ message: 'Token no válido o expirado' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'No autorizado, no hay token' });
    }
};