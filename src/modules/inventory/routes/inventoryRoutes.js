import { Router } from 'express';
import { body, param } from 'express-validator';
import { protect } from '../../../shared/middlewares/authMiddleware.js';
import { createDeck, equipWeapon, getMyDecks, getMyShips, setActiveDeck } from '../controllers/inventoryController.js';

const router = Router();

/**
 * Rutas protegidas para la gestión del inventario y puerto
 */
router.use(protect);

router.get('/ships', getMyShips);

router.patch('/ships/:shipId/equip', [
    param('shipId').isUUID().withMessage('Identificador de barco inválido'),
    body('weaponSlug').notEmpty().withMessage('El identificador del arma es obligatorio')
], equipWeapon);

router.get('/decks', getMyDecks);

router.post('/decks', [
    body('deckName').isLength({ min: 2, max: 30 }).withMessage('El nombre del mazo debe tener entre 2 y 30 caracteres'),
    body('shipIds').isArray({ min: 1 }).withMessage('El mazo debe contener al menos un barco')
], createDeck);

router.patch('/decks/:deckId/activate', [
    param('deckId').isUUID().withMessage('Identificador de mazo inválido')
], setActiveDeck);

export default router;