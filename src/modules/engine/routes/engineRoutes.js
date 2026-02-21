import { Router } from 'express';
import { body, param } from 'express-validator';
import { protect } from '../../../shared/middlewares/authMiddleware.js';
import { moveShip, rotateShip } from '../controllers/movementController.js';

const router = Router();

/**
 * Rutas protegidas para el motor de juego (acciones de unidades)
 */
router.use(protect);

router.post('/:matchId/move', [
    param('matchId').isUUID().withMessage('ID de partida inválido'),
    body('shipId').isUUID().withMessage('ID de barco inválido'),
    body('direction').isIn(['N', 'S', 'E', 'W']).withMessage('Dirección de movimiento inválida')
], moveShip);

router.post('/:matchId/rotate', [
    param('matchId').isUUID().withMessage('ID de partida inválido'),
    body('shipId').isUUID().withMessage('ID de barco inválido'),
    body('degrees').isIn([90, -90]).withMessage('La rotación debe ser de 90 o -90 grados')
], rotateShip);

export default router;