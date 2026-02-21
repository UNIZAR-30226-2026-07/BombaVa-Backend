import { jest } from '@jest/globals';

jest.unstable_mockModule('../models/User.js', () => ({
    default: {
        findOne: jest.fn(),
        create: jest.fn()
    }
}));

const UserDao = (await import('./UserDao.js')).default;
const User = (await import('../models/User.js')).default;

describe('UserDao Unit Tests', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('Should call findOne with correct username filter', async () => {
        User.findOne.mockResolvedValue({ id: '1', username: 'test' });
        await UserDao.findByName('test');
        expect(User.findOne).toHaveBeenCalledWith({ where: { username: 'test' } });
    });

    it('Should call findOne with correct email filter', async () => {
        User.findOne.mockResolvedValue({ id: '1', email: 't@t.com' });
        await UserDao.findByMail('t@t.com');
        expect(User.findOne).toHaveBeenCalledWith({ where: { email: 't@t.com' } });
    });
});