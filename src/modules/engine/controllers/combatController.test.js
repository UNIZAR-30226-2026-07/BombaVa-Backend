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

        jest.spyOn(Match, 'findByPk').mockResolvedValue({ turnNumber: 1 });
        jest.spyOn(ShipInstance, 'findByPk').mockResolvedValue({ lastAttackTurn: 0 });
        jest.spyOn(MatchPlayer, 'findOne').mockResolvedValue({ ammoCurrent: 10 });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('Debe fallar si el barco ya ha atacado en el turno actual', async () => {
        req.body = { shipId: 's1', target: { x: 2, y: 2 } };

        jest.spyOn(Match, 'findByPk').mockResolvedValue({ turnNumber: 5 });
        jest.spyOn(ShipInstance, 'findByPk').mockResolvedValue({ lastAttackTurn: 5 });

        await fireCannon(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: expect.stringContaining('ya ha atacado')
        }));
    });

    it('Debe procesar un impacto y devolver la vida restante', async () => {
        req.body = { shipId: 's1', target: { x: 2, y: 2 } };

        const objetivoMock = { currentHp: 10, save: jest.fn(), playerId: 'u2' };
        jest.spyOn(ShipInstance, 'findOne').mockResolvedValue(objetivoMock);
        jest.spyOn(ShipInstance, 'count').mockResolvedValue(1);

        await fireCannon(req, res, next);

        expect(objetivoMock.currentHp).toBe(0);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ hit: true, targetHp: 0 }));
    });
});