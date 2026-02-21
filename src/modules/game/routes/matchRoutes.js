import { Router } from 'express';
import { param } from 'express-validator';
import { protect } from '../../../shared/middlewares/authMiddleware.js';
import { getMatchStatus, requestPause } from '../controllers/matchController.js';
import { endTurn } from '../controllers/turnController.js';

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

router.post('/:matchId/turn/end', [
    param('matchId').isUUID().withMessage('Identificador de partida inválido')
], endTurn);

export default router;