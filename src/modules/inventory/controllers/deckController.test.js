import { jest } from '@jest/globals';

jest.unstable_mockModule('../dao/InventoryDao.js', () => ({
    default: {
        findUserDecks: jest.fn(),
        createDeck: jest.fn(),
        activateDeck: jest.fn()
    }
}));

jest.unstable_mockModule('express-validator', () => ({
    validationResult: jest.fn(() => ({
        isEmpty: () => true,
        array: () => []
    }))
}));

const { getMyDecks, createDeck, setActiveDeck } = await import('./deckController.js');
const InventoryDao = (await import('../dao/InventoryDao.js')).default;

describe('DeckController Unit Tests', () => {
    let req, res, next;

    beforeEach(() => {
        req = { user: { id: 'u1' }, params: {}, body: {} };
        res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
        next = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('Should return decks for the authenticated user', async () => {
        const decksMock = [{ id: 'd1', deckName: 'Test' }];
        InventoryDao.findUserDecks.mockResolvedValue(decksMock);

        await getMyDecks(req, res, next);

        expect(res.json).toHaveBeenCalledWith(decksMock);
    });

    it('Should fail if ship position is outside 5x15 grid (y > 4)', async () => {
        req.body = {
            deckName: 'Invalid',
            shipIds: [{ position: { x: 0, y: 10 } }]
        };

        await createDeck(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Posición fuera de límites (5x15)' });
    });

    it('Should create a deck if positions are valid', async () => {
        req.body = {
            deckName: 'Valid Deck',
            shipIds: [{ position: { x: 5, y: 2 } }]
        };
        InventoryDao.createDeck.mockResolvedValue({ id: 'd1' });

        await createDeck(req, res, next);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(InventoryDao.createDeck).toHaveBeenCalled();
    });

    it('Should call activateDeck and return 404 if it does not exist', async () => {
        req.params.deckId = 'd99';
        InventoryDao.activateDeck.mockResolvedValue(null);

        await setActiveDeck(req, res, next);

        expect(res.status).toHaveBeenCalledWith(404);
    });
});