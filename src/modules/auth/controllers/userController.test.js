import { jest } from '@jest/globals';

jest.unstable_mockModule('../models/User.js', () => ({
    default: {
        findByPk: jest.fn(),
        findAll: jest.fn()
    }
}));

const { getProfile, getLeaderboard } = await import('./userController.js');
const User = (await import('../models/User.js')).default;

describe('UserController Unit Tests', () => {
    let req, res, next;

    beforeEach(() => {
        req = { user: { id: 'u1' } };
        res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
        next = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('getProfile debe llamar a findByPk con los atributos de seguridad correctos', async () => {
        User.findByPk.mockResolvedValue({ id: 'u1', username: 'tester' });

        await getProfile(req, res, next);

        expect(User.findByPk).toHaveBeenCalledWith('u1', expect.objectContaining({
            attributes: expect.arrayContaining(['username', 'elo_rating'])
        }));
        expect(res.json).toHaveBeenCalled();
    });

    it('getLeaderboard debe llamar a findAll con ordenacion descendente por ELO', async () => {
        User.findAll.mockResolvedValue([]);

        await getLeaderboard(req, res, next);

        expect(User.findAll).toHaveBeenCalledWith(expect.objectContaining({
            order: [['elo_rating', 'DESC']],
            limit: 50
        }));
        expect(res.json).toHaveBeenCalled();
    });
});