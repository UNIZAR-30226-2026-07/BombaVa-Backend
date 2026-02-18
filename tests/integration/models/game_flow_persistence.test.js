import { Match, MatchPlayer, sequelize, User } from '../../../src/shared/models/index.js';

describe('Game Flow Persistence (Integration)', () => {
    beforeAll(async () => {
        await sequelize.query('DROP SCHEMA public CASCADE;');
        await sequelize.query('CREATE SCHEMA public;');
        await sequelize.sync({ force: true });
    });

    afterAll(async () => {
        await sequelize.close();
    });

    it('Debe persistir una partida con dos jugadores en bandos opuestos', async () => {
        const u1 = await User.create({ username: 'p1', email: 'p1@b.va', password_hash: '1' });
        const u2 = await User.create({ username: 'p2', email: 'p2@b.va', password_hash: '2' });
        const match = await Match.create({
            status: 'PLAYING',
            mapTerrain: { size: 15, islands: [[1, 1], [5, 5]] }
        });

        await MatchPlayer.create({ match_id: match.id, user_id: u1.id, side: 'NORTH' });
        await MatchPlayer.create({ match_id: match.id, user_id: u2.id, side: 'SOUTH' });

        const fullMatch = await Match.findByPk(match.id, {
            include: [User]
        });

        expect(fullMatch.Users).toHaveLength(2);
        expect(fullMatch.status).toBe('PLAYING');
        expect(fullMatch.mapTerrain.size).toBe(15);

        const players = await MatchPlayer.findAll({ where: { match_id: match.id } });
        expect(players.find(p => p.user_id === u1.id).side).toBe('NORTH');
        expect(players.find(p => p.user_id === u2.id).side).toBe('SOUTH');
    });
});