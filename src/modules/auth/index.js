/**
 * Fachada del módulo de Autenticación.
 * Expone las rutas y servicios públicos para el resto de la aplicación.
 */
import authRoutes from './routes/authRoutes.js';
import * as authService from './services/authService.js';

export {
    authRoutes,
    authService
};
