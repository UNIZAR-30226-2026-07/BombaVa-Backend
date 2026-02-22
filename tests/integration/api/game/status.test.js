import { jest } from '@jest/globals';
import { Match, sequelize } from '../../../shared/models/index.js';
import { getMatchStatus } from './matchController.js';

describe('MatchController Unit Tests', () => {
    beforeAll(async () => {
        await sequelize.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
        await sequelize.sync({ force: true });
    });

    afterAll(async () => {
        await sequelize.close();
    });

    it('Debe devolver el estado de la partida si el ID es correcto', async () => {
        const m = await Match.create({
            status: 'WAITING',
            mapTerrain: { size: 15, obstacles: [] }
        });

        const req = {
            params: { matchId: m.id },
            user: { id: '550e8400-e29b-41d4-a716-446655440000' }
        };
        const res = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis()
        };
        const next = jest.fn();

        await getMatchStatus(req, res, next);

        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ id: m.id }));
    });
});