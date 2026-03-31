import { findByIdAndUser } from './UserShipDao.js';

describe('UserShipDao Unit Tests', () => {
    it('Should be defined as a pure function', () => {
        expect(typeof findByIdAndUser).toBe('function');
    });
});