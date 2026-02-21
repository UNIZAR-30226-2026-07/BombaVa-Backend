import { Match, MatchPlayer, sequelize, User } from '../../../src/shared/models/index.js';

describe('Game Flow Persistence (Integration)', () => {
    beforeAll(async () => {
        await sequelize.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
        await sequelize.sync({ force: true });
    });

    afterAll(async () => {
        await sequelize.close();
    });

    it('Debe persistir una partida con dos jugadores en bandos opuestos', async () => {
        const u1 = await User.create({ username: 'p1', email: 'p1@b.va', password_hash: '1' });
        const u2 = await User.create({ username: 'p2', email: 'p2@b.va', password_hash: '2' });
        const match = await Match.create({ status: 'PLAYING', mapTerrain: { size: 15 } });

        await MatchPlayer.create({ matchId: match.id, userId: u1.id, side: 'NORTH' });
        await MatchPlayer.create({ matchId: match.id, userId: u2.id, side: 'SOUTH' });

        const players = await MatchPlayer.findAll({ where: { matchId: match.id } });

        const player1 = players.find(p => p.userId === u1.id);
        const player2 = players.find(p => p.userId === u2.id);

        expect(player1.side).toBe('NORTH');
        expect(player2.side).toBe('SOUTH');
    });
});