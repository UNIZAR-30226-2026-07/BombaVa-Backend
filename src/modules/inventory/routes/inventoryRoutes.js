import { Router } from 'express';
import { body } from 'express-validator';
import { protect } from '../../../shared/middlewares/authMiddleware.js';
import { createDeck, equipWeapon, getMyDecks, getMyShips, setActiveDeck } from '../controllers/inventoryController.js';

const router = Router();

/**
 * Rutas de inventario y puerto
 */
router.use(protect);

router.get('/ships', getMyShips);

router.patch('/ships/:shipId/equip', [
    body('weaponSlug').notEmpty().withMessage('El identificador del arma es obligatorio')
], equipWeapon);

router.get('/decks', getMyDecks);

router.post('/decks', [
    body('deckName').isLength({ min: 3 }).withMessage('Nombre de mazo inválido'),
    body('shipIds').isArray({ min: 1 }).withMessage('El mazo debe contener barcos')
], createDeck);

router.patch('/decks/:deckId/activate', setActiveDeck);

export default router;