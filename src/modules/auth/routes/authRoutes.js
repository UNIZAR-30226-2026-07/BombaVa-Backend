import { Router } from 'express';
import { body } from 'express-validator';
import { registerUser } from '../controllers/authController.js';

const router = Router();

/**
 * Petición POST a /api/auth/register
 */
router.post('/register', registerUser);
//TODO: Comentar mejor esto


export default router;