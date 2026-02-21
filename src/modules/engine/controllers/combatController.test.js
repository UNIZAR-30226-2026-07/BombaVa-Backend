import { jest } from '@jest/globals';
import { Match, MatchPlayer, sequelize, ShipInstance } from '../../../shared/models/index.js';
import { fireCannon } from './combatController.js';

describe('CombatController Unit Tests', () => {
    let req, res, next;

    beforeEach(() => {
        req = { params: { matchId: 'm1' }, body: {}, user: { id: 'u1' } };
        res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
        next = jest.fn();

        jest.spyOn(sequelize, 'transaction').mockResolvedValue({
            commit: jest.fn(),
            rollback: jest.fn()
        });
    });

    it('Debe fallar si el barco ya ha atacado en el turno actual', async () => {
        req.body = { shipId: 's1', target: { x: 2, y: 2 } };

        jest.spyOn(Match, 'findByPk').mockResolvedValue({ turnNumber: 5 });
        jest.spyOn(ShipInstance, 'findByPk').mockResolvedValue({ lastAttackTurn: 5 });
        jest.spyOn(MatchPlayer, 'findOne').mockResolvedValue({ userId: 'u1' });

        await fireCannon(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
    });

    it('Debe fallar si el objetivo está fuera de rango (> 4 casillas)', async () => {
        req.body = { shipId: 's1', target: { x: 10, y: 10 } };

        jest.spyOn(Match, 'findByPk').mockResolvedValue({ turnNumber: 1 });
        jest.spyOn(ShipInstance, 'findByPk').mockResolvedValue({ x: 0, y: 0, lastAttackTurn: 0 });
        jest.spyOn(MatchPlayer, 'findOne').mockResolvedValue({ ammoCurrent: 10 });

        await fireCannon(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
    });
});