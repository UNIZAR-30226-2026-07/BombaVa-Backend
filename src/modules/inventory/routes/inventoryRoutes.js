import { Router } from 'express';
import { body } from 'express-validator';
import { protect } from '../../../shared/middlewares/authMiddleware.js';
import { equipWeapon, getMyShips } from '../controllers/inventoryController.js';

const router = Router();

/**
 * Rutas protegidas para la gestión del puerto/inventario
 */
router.use(protect);

router.get('/ships', getMyShips);

router.patch('/ships/:shipId/equip', [
    body('weaponSlug').notEmpty().withMessage('El identificador del arma es obligatorio')
], equipWeapon);

export default router;