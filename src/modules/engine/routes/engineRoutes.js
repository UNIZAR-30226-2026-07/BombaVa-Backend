import { Router } from 'express';
import { body, param } from 'express-validator';
import { protect } from '../../../shared/middlewares/authMiddleware.js';
import { fireCannon } from '../controllers/combatController.js';
import { moveShip, rotateShip } from '../controllers/movementController.js';
import { dropMine, launchTorpedo } from '../controllers/projectileController.js';

const router = Router();

router.use(protect);

router.post('/:matchId/move', [
    param('matchId').isUUID().withMessage('ID de partida inválido'),
    body('shipId').isUUID().withMessage('ID de barco inválido'),
    body('direction').isIn(['N', 'S', 'E', 'W']).withMessage('Dirección inválida')
], moveShip);

router.post('/:matchId/rotate', [
    param('matchId').isUUID().withMessage('ID de partida inválido'),
    body('shipId').isUUID().withMessage('ID de barco inválido'),
    body('degrees').isIn([90, -90]).withMessage('Rotación inválida')
], rotateShip);

router.post('/:matchId/attack/cannon', [
    param('matchId').isUUID().withMessage('ID de partida inválido'),
    body('shipId').isUUID().withMessage('ID de barco inválido'),
    body('target.x').isInt({ min: 0, max: 14 }),
    body('target.y').isInt({ min: 0, max: 14 })
], fireCannon);

router.post('/:matchId/attack/torpedo', [
    param('matchId').isUUID().withMessage('ID de partida inválido'),
    body('shipId').isUUID().withMessage('ID de barco inválido')
], launchTorpedo);

router.post('/:matchId/attack/mine', [
    param('matchId').isUUID().withMessage('ID de partida inválido'),
    body('shipId').isUUID().withMessage('ID de barco inválido'),
    body('target.x').isInt({ min: 0, max: 14 }),
    body('target.y').isInt({ min: 0, max: 14 })
], dropMine);

export default router;