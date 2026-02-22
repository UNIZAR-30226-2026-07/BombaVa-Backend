import { jest } from '@jest/globals';

/**
 * Mockeo de dependencias para entorno ESM puro
 */
jest.unstable_mockModule('express-validator', () => ({
    validationResult: jest.fn(() => ({
        isEmpty: () => true,
        array: () => []
    }))
}));

jest.unstable_mockModule('../../game/controllers/matchStatusController.js', () => ({
    checkWinCondition: jest.fn()
}));

jest.unstable_mockModule('../../../shared/models/index.js', () => ({
    Match: { findByPk: jest.fn() },
    MatchPlayer: { findOne: jest.fn() },
    ShipInstance: { findByPk: jest.fn(), findOne: jest.fn() },
    sequelize: {
        transaction: jest.fn(() => ({
            commit: jest.fn(),
            rollback: jest.fn()
        }))
    }
}));

const { fireCannon } = await import('./combatController.js');
const { Match, MatchPlayer, ShipInstance } = await import('../../../shared/models/index.js');
const { checkWinCondition } = await import('../../game/controllers/matchStatusController.js');

describe('CombatController Unit Tests', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            params: { matchId: 'm1' },
            body: { shipId: 's1', target: { x: 2, y: 2 } },
            user: { id: 'u1' }
        };
        res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
        next = jest.fn();

        Match.findByPk.mockResolvedValue({ turnNumber: 1 });
        ShipInstance.findByPk.mockResolvedValue({
            id: 's1', x: 0, y: 0, lastAttackTurn: 0, save: jest.fn()
        });
        MatchPlayer.findOne.mockResolvedValue({
            ammoCurrent: 10, save: jest.fn()
        });
        checkWinCondition.mockResolvedValue(false);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    /**
     * Verifica que un disparo a larga distancia devuelva error 400
     */
    it('Should fail if the target is further than 4 cells away', async () => {
        // Distancia desde (0,0) a (10,10) es ~14.14, mayor que 4
        req.body = { shipId: 's1', target: { x: 10, y: 10 } };

        await fireCannon(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: expect.stringContaining('fuera de rango')
        }));
    });

    /**
     * Verifica que un impacto válido procese el daño correctamente
     */
    it('Should process a hit and return the remaining HP of the target', async () => {
        req.body = { shipId: 's1', target: { x: 1, y: 1 } };
        const targetMock = { currentHp: 10, save: jest.fn(), playerId: 'u2' };
        ShipInstance.findOne.mockResolvedValue(targetMock);

        await fireCannon(req, res, next);

        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            hit: true,
            targetHp: 0
        }));
    });
});