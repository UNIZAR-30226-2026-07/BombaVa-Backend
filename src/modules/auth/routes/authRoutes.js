import { Router } from 'express';
import { body } from 'express-validator';
import { loginUser, registerUser } from '../controllers/authController.js';

const router = Router();

/**
 * Petición POST a /api/auth/register
 * Registro de un nuevo usuario
 */
router.post('/register', [
    body('username').notEmpty().withMessage('El nombre de usuario es obligatorio'),
    body('email').isEmail().withMessage('Debe ser un email válido'),
    body('contrasena').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres')
], registerUser);

/**
 * Petición POST a /api/auth/login
 * Inicio de sesión de un usuario existente
 */
router.post('/login', [
    body('email').isEmail().withMessage('Debe ser un email válido'),
    body('contrasena').notEmpty().withMessage('La contraseña es obligatoria')
], loginUser);

export default router;