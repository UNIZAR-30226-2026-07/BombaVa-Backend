import { Router } from 'express';
import { body, param } from 'express-validator';
import { protect } from '../../../shared/middlewares/authMiddleware.js';
import { createDeck, getMyDecks, setActiveDeck, updateDeck, deleteDeck } from '../controllers/deckController.js';
import { equipWeapon, getMyShips, removeWeaponFromShip, showAllWeapons } from '../controllers/inventoryController.js';

const router = Router();

router.use(protect);

router.get('/weapons', showAllWeapons);

router.get('/ships', getMyShips);

router.patch('/ships/:shipId/equip', [
    param('shipId').isUUID().withMessage('Identificador de barco inválido'),
    body('weaponSlug').notEmpty().withMessage('El identificador del arma es obligatorio')
], equipWeapon);

router.delete('/ships/:shipId/weapons/:weaponSlug', [
    param('shipId').isUUID().withMessage('Identificador de barco inválido'),
    param('weaponSlug').notEmpty().withMessage('El identificador del arma es obligatorio')
], removeWeaponFromShip);

router.get('/decks', getMyDecks);

router.post('/decks', [
    body('deckName').isLength({ min: 2, max: 30 }).withMessage('Nombre inválido'),
    body('shipIds').isArray({ min: 1 }).withMessage('Mazo vacío')
], createDeck);

router.patch('/decks/:deckId/activate', [
    param('deckId').isUUID().withMessage('ID inválido')
], setActiveDeck);

// ACTUALIZAR Mazo (Barcos o nombre)
router.put('/decks/:deckId', [
    param('deckId').isUUID().withMessage('ID de mazo inválido'),
    body('deckName').optional().isLength({ min: 2, max: 30 }),
    body('shipIds').optional().isArray({ min: 1 })
], updateDeck);

// ELIMINAR Mazo
router.delete('/decks/:deckId', [
    param('deckId').isUUID().withMessage('ID de mazo inválido')
], deleteDeck);


export default router;