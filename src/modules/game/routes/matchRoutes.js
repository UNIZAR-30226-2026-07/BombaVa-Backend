import { Router } from 'express';
import { param } from 'express-validator';
import { protect } from '../../../shared/middlewares/authMiddleware.js';
import { getMatchHistory, getMatchStatus, requestPause } from '../controllers/matchController.js';
import { endTurn } from '../controllers/turnController.js';

const router = Router();

router.use(protect);

router.get('/history', getMatchHistory);

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