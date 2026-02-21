import { Router } from 'express';
import { param } from 'express-validator';
import { protect } from '../../../shared/middlewares/authMiddleware.js';
import { getMatchStatus, requestPause } from '../controllers/matchController.js';

const router = Router();

/**
 * Rutas protegidas para la interacción con partidas en curso
 */
router.use(protect);

router.get('/:matchId', [
    param('matchId').isUUID().withMessage('Identificador de partida inválido')
], getMatchStatus);

router.post('/:matchId/pause', [
    param('matchId').isUUID().withMessage('Identificador de partida inválido')
], requestPause);

export default router;