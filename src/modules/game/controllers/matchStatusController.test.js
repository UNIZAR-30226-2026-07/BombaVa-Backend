import { jest } from '@jest/globals';

jest.unstable_mockModule('../../../shared/models/index.js', () => ({
    Match: { update: jest.fn(), findByPk: jest.fn() },
    ShipInstance: { count: jest.fn() }
}));

const { surrenderMatch, checkWinCondition } = await import('./matchStatusController.js');
const { Match, ShipInstance } = await import('../../../shared/models/index.js');

describe('MatchStatusController Unit Tests', () => {
    let req, res, next;

    beforeEach(() => {
        req = { params: { matchId: 'm1' } };
        res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
        next = jest.fn();
    });

    it('Should finalize match on surrender', async () => {
        const matchMock = { id: 'm1', status: 'PLAYING', save: jest.fn() };
        Match.findByPk.mockResolvedValue(matchMock);

        await surrenderMatch(req, res, next);

        expect(matchMock.status).toBe('FINISHED');
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ status: 'FINISHED' }));
    });

    it('Should return true and update match if no ships remain', async () => {
        ShipInstance.count.mockResolvedValue(0);
        const result = await checkWinCondition('m1', 'p1');
        expect(result).toBe(true);
        expect(Match.update).toHaveBeenCalledWith({ status: 'FINISHED' }, expect.anything());
    });
});