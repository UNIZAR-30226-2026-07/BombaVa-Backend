import { Router } from 'express';
import { body, param } from 'express-validator';
import { protect } from '../../../shared/middlewares/authMiddleware.js';
import { createDeck, getMyDecks, setActiveDeck } from '../controllers/deckController.js';
import { equipWeapon, getMyShips } from '../controllers/inventoryController.js';

const router = Router();

router.use(protect);

router.get('/ships', getMyShips);

router.patch('/ships/:shipId/equip', [
    param('shipId').isUUID().withMessage('Identificador de barco inválido'),
    body('weaponSlug').notEmpty().withMessage('El identificador del arma es obligatorio')
], equipWeapon);

router.get('/decks', getMyDecks);

router.post('/decks', [
    body('deckName').isLength({ min: 2, max: 30 }).withMessage('Nombre inválido'),
    body('shipIds').isArray({ min: 1 }).withMessage('Mazo vacío')
], createDeck);

router.patch('/decks/:deckId/activate', [
    param('deckId').isUUID().withMessage('ID inválido')
], setActiveDeck);

export default router;