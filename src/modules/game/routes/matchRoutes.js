import { Router } from 'express';
import { param } from 'express-validator';
import { protect } from '../../../shared/middlewares/authMiddleware.js';
import { getMatchHistory, getMatchStatus, requestPause } from '../controllers/matchController.js';
import { surrenderMatch } from '../controllers/matchStatusController.js';
import { endTurn } from '../controllers/turnController.js';

const router = Router();

router.use(protect);

router.get('/history', getMatchHistory);
router.get('/:matchId', [param('matchId').isUUID()], getMatchStatus);
router.post('/:matchId/pause', [param('matchId').isUUID()], requestPause);
router.post('/:matchId/turn/end', [param('matchId').isUUID()], endTurn);
router.post('/:matchId/surrender', [param('matchId').isUUID()], surrenderMatch);

export default router;