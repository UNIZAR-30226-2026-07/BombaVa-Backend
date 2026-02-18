import { Router } from 'express';
import { body } from 'express-validator';
import { registerUser } from '../controllers/authController.js';

const router = Router();

/**
 * Petición POST a /api/auth/register
 * Validaciones exhaustivas de entrada
 */
router.post('/register', [
    body('username').notEmpty().withMessage('El nombre de usuario es obligatorio'),
    body('email').isEmail().withMessage('Debe ser un email válido'),
    body('contrasena').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres')
], registerUser);

export default router;