import { Router } from 'express';
import { body } from 'express-validator';
import { protect } from '../../../shared/middlewares/authMiddleware.js';
import { loginUser, registerUser } from '../controllers/authController.js';
import { getLeaderboard, getProfile } from '../controllers/userController.js';

const router = Router();

/**
 * Rutas públicas de autenticación
 */
router.post('/register', [
    body('username').notEmpty().withMessage('El nombre de usuario es obligatorio'),
    body('email').isEmail().withMessage('Debe ser un email válido'),
    body('contrasena').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres')
], registerUser);

/**
 * Inicio de sesión
 */
router.post('/login', [
    body('email').isEmail().withMessage('Debe ser un email válido'),
    body('contrasena').notEmpty().withMessage('La contraseña es obligatoria')
], loginUser);

/**
 * Rutas protegidas de usuario y comunidad
 */
router.get('/me', protect, getProfile);
router.get('/ranking', protect, getLeaderboard);

export default router;