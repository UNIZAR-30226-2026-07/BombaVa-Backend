import { Match, sequelize } from '../../../shared/models/index.js';
import { getMatchStatus } from './matchController.js';

describe('MatchController Unit Tests (Status & History)', () => {
    beforeAll(async () => {
        await sequelize.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
        await sequelize.sync({ force: true });
    });

    afterAll(async () => {
        await sequelize.close();
    });

    it('Debe validar que el controlador de estado responde correctamente', async () => {
        const m = await Match.create({ status: 'WAITING', mapTerrain: { size: 15 } });

        const req = { params: { matchId: m.id } };
        const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
        const next = jest.fn();

        await getMatchStatus(req, res, next);

        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ id: m.id }));
    });
});