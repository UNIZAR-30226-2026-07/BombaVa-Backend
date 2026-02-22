import { Router } from 'express';
import { param } from 'express-validator';
import { protect } from '../../../shared/middlewares/authMiddleware.js';
import { getMatchHistory, getMatchStatus, requestPause } from '../controllers/matchController.js';
import { surrenderMatch } from '../controllers/matchStatusController.js';
import { endTurn } from '../controllers/turnController.js';

const router = Router();

router.use(protect);

router.get('/history', getMatchHistory);

router.get('/:matchId', [
    param('matchId').isUUID().withMessage('ID de partida inválido')
], getMatchStatus);

router.post('/:matchId/pause', [
    param('matchId').isUUID().withMessage('ID de partida inválido')
], requestPause);

router.post('/:matchId/turn/end', [
    param('param').isUUID().withMessage('ID de partida inválido')
], endTurn);

router.post('/:matchId/surrender', [
    param('matchId').isUUID().withMessage('ID de partida inválido')
], surrenderMatch);

export default router;