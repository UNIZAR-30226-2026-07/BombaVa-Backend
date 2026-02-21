import { MatchPlayer, User, sequelize } from '../../../shared/models/index.js';
import { initializeMatchPersistence } from './matchController.js';

describe('MatchController Unit Tests', () => {
    beforeAll(async () => {
        await sequelize.sync({ force: true });
    });

    afterAll(async () => {
        await sequelize.close();
    });

    it('Debe crear una partida y dos MatchPlayers con sus bandos persistidos', async () => {
        const u1 = await User.create({
            username: 'user_north',
            email: 'north@test.com',
            password_hash: 'hash'
        });
        const u2 = await User.create({
            username: 'user_south',
            email: 'south@test.com',
            password_hash: 'hash'
        });

        const usuariosMock = [
            { id: u1.id, socketId: 's1' },
            { id: u2.id, socketId: 's2' }
        ];

        const partida = await initializeMatchPersistence(usuariosMock);

        expect(partida.id).toBeDefined();
        expect(partida.status).toBe('PLAYING');

        const jugadores = await MatchPlayer.findAll({ where: { matchId: partida.id } });
        expect(jugadores).toHaveLength(2);

        const bandos = jugadores.map(j => j.side);
        expect(bandos).toContain('NORTH');
        expect(bandos).toContain('SOUTH');
    });
});