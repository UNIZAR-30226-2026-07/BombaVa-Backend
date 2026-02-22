/**
 * Rutas del módulo de Juego.
 * Solo mantiene los endpoints de consulta asíncrona
 * Las acciones de partida en curso se gestionan mediante Sockets.
 */
import { Router } from 'express';
import { protect } from '../../../shared/middlewares/authMiddleware.js';
import { getMatchHistory } from '../controllers/matchController.js';

const router = Router();

/**
 * Todas las rutas de partidas requieren autenticación.
 */
router.use(protect);

/**
 * Obtener el historial de partidas del usuario.
 */
router.get('/history', getMatchHistory);

export default router;