/**
 * Rutas de Autenticación y Usuario
 */
import { Router } from 'express';
import { body } from 'express-validator';
import { protect } from '../../../shared/middlewares/authMiddleware.js';
import { loginUser, registerUser } from '../controllers/authController.js';
import { getLeaderboard, getProfile, updateProfile } from '../controllers/userController.js';

const router = Router();

router.post('/register', [
    body('username').notEmpty().withMessage('El nombre de usuario es obligatorio'),
    body('email').isEmail().withMessage('Debe ser un email válido'),
    body('contrasena').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres')
], registerUser);

router.post('/login', [
    body('email').isEmail().withMessage('Debe ser un email válido'),
    body('contrasena').notEmpty().withMessage('La contraseña es obligatoria')
], loginUser);

router.get('/me', protect, getProfile);

router.patch('/me', protect, [
    body('username').optional().notEmpty(),
    body('email').optional().isEmail()
], updateProfile);

router.get('/ranking', protect, getLeaderboard);

export default router;