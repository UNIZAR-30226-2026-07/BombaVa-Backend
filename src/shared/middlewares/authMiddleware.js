import jwt from 'jsonwebtoken';
import User from '../../modules/auth/models/User.js';

/**
 * Middleware que protege rutas verificando el token JWT
 * @param {object} req - Objeto de petición
 * @param {object} res - Objeto de respuesta
 * @param {function} next - Siguiente función
 */
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

            next();
        } catch (error) {
            console.error('Error de token:', error);
            res.status(401).json({ message: 'Token no válido o expirado' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'No autorizado, no hay token' });
    }
};