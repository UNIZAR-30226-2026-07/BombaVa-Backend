/**
 * Test de Integración: Modelo Match
 * Valida la creación de la partida y sus jugadores relacionados.
 */
import { sequelize } from '../../../config/db.js';
import { Match, MatchPlayer } from '../../../shared/models/index.js';
import { createCompleteMatch } from '../../../shared/models/testFactory.js';

describe('Match Model Persistence (Refactored)', () => {
    let setup;

    beforeAll(async () => {
        await sequelize.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
        await sequelize.sync({ force: true });

        setup = await createCompleteMatch(
            { username: 'match_h', email: 'h@m.va' },
            { username: 'match_g', email: 'g@m.va' }
        );
    });

    afterAll(async () => {
        await sequelize.close();
    });

    it('Debe recuperar la partida vinculada a dos MatchPlayers reales', async () => {
        const matchInDb = await Match.findByPk(setup.match.id, {
            include: [MatchPlayer]
        });

        expect(matchInDb.MatchPlayers).toHaveLength(2);
        expect(matchInDb.status).toBe('PLAYING');
    });

    it('Debe verificar que los bandos NORTH y SOUTH están asignados', async () => {
        const players = await MatchPlayer.findAll({ where: { matchId: setup.match.id } });
        const sides = players.map(p => p.side);

        expect(sides).toContain('NORTH');
        expect(sides).toContain('SOUTH');
    });
});