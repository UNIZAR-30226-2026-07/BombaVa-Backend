import { Router } from 'express';
import { body } from 'express-validator';
import { protect } from '../../../shared/middlewares/authMiddleware.js';
import { getProfile, loginUser, registerUser } from '../controllers/authController.js';

const router = Router();

/**
 * Registro de un nuevo usuario
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
 * Consulta de perfil propio (Protegida)
 */
router.get('/me', protect, getProfile);

export default router;