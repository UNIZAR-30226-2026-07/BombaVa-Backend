/**
 * Fachada del módulo de Autenticación.
 */
import { authController, userController } from './controllers/index.js';
import User from './models/User.js';
import authRoutes from './routes/authRoutes.js';
import { authService, userService } from './services/index.js';

export {
    authController, authRoutes,
    authService, User, userController, userService
};
