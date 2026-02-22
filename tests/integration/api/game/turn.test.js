import { jest } from '@jest/globals';

jest.unstable_mockModule('../../../shared/models/index.js', () => ({
    Match: { findByPk: jest.fn() },
    MatchPlayer: { findOne: jest.fn() },
    sequelize: { transaction: jest.fn(() => ({ commit: jest.fn(), rollback: jest.fn() })) }
}));

const { endTurn } = await import('./turnController.js');
const { Match } = await import('../../../shared/models/index.js');

describe('TurnController Unit Tests', () => {
    let req, res, next;

    beforeEach(() => {
        req = { params: { matchId: 'm1' }, user: { id: 'u1' } };
        res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
        next = jest.fn();
    });

    it('Should fail if requester is not the current turn player', async () => {
        Match.findByPk.mockResolvedValue({
            status: 'PLAYING',
            currentTurnPlayerId: 'u2',
            MatchPlayers: []
        });

        await endTurn(req, res, next);
        expect(res.status).toHaveBeenCalledWith(403);
    });

    it('Should increment turn and regenerate opponent resources', async () => {
        const opMock = { userId: 'u2', fuelReserve: 10, ammoCurrent: 0, save: jest.fn() };
        const matchMock = {
            status: 'PLAYING',
            currentTurnPlayerId: 'u1',
            turnNumber: 1,
            MatchPlayers: [{ userId: 'u1' }, opMock],
            save: jest.fn()
        };
        Match.findByPk.mockResolvedValue(matchMock);

        await endTurn(req, res, next);

        expect(matchMock.turnNumber).toBe(2);
        expect(opMock.fuelReserve).toBe(20);
        expect(opMock.ammoCurrent).toBe(5);
    });
});