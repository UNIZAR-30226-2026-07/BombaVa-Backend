import { MatchPlayer, User, sequelize } from '../../../shared/models/index.js';
import { initializeMatchPersistence } from './matchSetupController.js';

describe('MatchSetupController Unit Tests', () => {
    beforeAll(async () => {
        await sequelize.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
        await sequelize.sync({ force: true });
    });

    afterAll(async () => {
        await sequelize.close();
    });

    it('Debe inicializar la persistencia de una partida con sus jugadores correctamente', async () => {
        const u1 = await User.create({ username: 'setup_1', email: 's1@t.com', password_hash: '1' });
        const u2 = await User.create({ username: 'setup_2', email: 's2@t.com', password_hash: '1' });

        const usuarios = [
            { id: u1.id, socketId: 'sock1' },
            { id: u2.id, socketId: 'sock2' }
        ];

        const partida = await initializeMatchPersistence(usuarios);

        expect(partida.id).toBeDefined();
        expect(partida.status).toBe('PLAYING');

        const jugadores = await MatchPlayer.findAll({ where: { matchId: partida.id } });
        expect(jugadores).toHaveLength(2);
    });
});