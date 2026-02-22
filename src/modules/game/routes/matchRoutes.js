/**
 * Rutas del módulo de Juego.
 * Define los puntos de entrada REST para consultas de metadatos.
 */
import { Router } from 'express';
import { protect } from '../../../shared/index.js';
import { getMatchHistory } from '../controllers/matchController.js';

const router = Router();

/**
 * Middleware de protección para todas las rutas de este módulo.
 */
router.use(protect);

/**
 * Ruta para obtener el historial de partidas del jugador.
 */
router.get('/history', getMatchHistory);

export default router;