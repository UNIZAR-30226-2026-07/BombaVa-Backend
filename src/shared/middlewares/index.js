/**
 * Fachada de Middlewares compartidos.
 */
import { protect } from './authMiddleware.js';
import { errorHandler } from './errorMiddleware.js';
import { socketProtect } from './socketMiddleware.js';

export {
    errorHandler, protect,
    socketProtect
};
