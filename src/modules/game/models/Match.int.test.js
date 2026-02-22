/**
 * Test de Integración: Persistencia de Flujo de Juego
 * Valida la creación de la partida y sus jugadores relacionados.
 */
import { sequelize } from '../../../config/db.js';
import { Match, MatchPlayer, User } from '../../../shared/models/index.js';

describe('Match Model Persistence (Colocated)', () => {
    beforeAll(async () => {
        await sequelize.sync({ force: true });
    });

    afterAll(async () => {
        await sequelize.close();
    });

    it('Debe persistir una partida vinculando a dos usuarios correctamente', async () => {
        const u1 = await User.create({ username: 'flow1', email: 'f1@t.com', password_hash: '1' });
        const u2 = await User.create({ username: 'flow2', email: 'f2@t.com', password_hash: '1' });

        const m = await Match.create({ status: 'PLAYING', mapTerrain: { size: 15 } });

        await MatchPlayer.create({ matchId: m.id, userId: u1.id, side: 'NORTH' });
        await MatchPlayer.create({ matchId: m.id, userId: u2.id, side: 'SOUTH' });

        const players = await MatchPlayer.findAll({ where: { matchId: m.id } });
        expect(players).toHaveLength(2);
        expect(players.map(p => p.side)).toContain('NORTH');
        expect(players.map(p => p.side)).toContain('SOUTH');
    });
});