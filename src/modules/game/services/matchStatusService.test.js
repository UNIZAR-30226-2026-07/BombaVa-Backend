/**
 * Test de Integración: Servicio de Estado de Partida
 */
import { sequelize, User } from '../../../shared/models/index.js';
import { createCompleteMatch } from '../../../shared/models/testFactory.js';
import EngineDao from '../../engine/dao/EngineDao.js';
import MatchDao from '../dao/MatchDao.js';
import * as matchStatusService from './matchStatusService.js';

describe('MatchStatusService Integration Tests', () => {
    let matchContext;

    beforeAll(async () => {
        await sequelize.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
        await sequelize.sync({ force: true });
        matchContext = await createCompleteMatch(
            { username: 'hero_player', email: 'hero@test.com' },
            { username: 'villain_player', email: 'villain@test.com' }
        );
    });

    afterAll(async () => {
        await sequelize.close();
    });

    describe('verificarDerrotaJugador', () => {
        it('Debe devolver false si al jugador le quedan barcos vivos', async () => {
            const { match, host } = matchContext;
            const estaDerrotado = await matchStatusService.verificarDerrotaJugador(match.id, host.user.id);
            expect(estaDerrotado).toBe(false);
        });

        it('Debe devolver true si el jugador NO tiene barcos vivos', async () => {
            const { match, guest, shipG } = matchContext;
            await EngineDao.registerHit(shipG.id, 0, [{x: 5, y: 7}], true);
            
            const estaDerrotado = await matchStatusService.verificarDerrotaJugador(match.id, guest.user.id);
            expect(estaDerrotado).toBe(true);
        });
    });

    describe('registrarVictoria y Anti-Spam', () => {
        it('Debe procesar el ELO solo una vez, incluso bajo condiciones de carrera (Spam)', async () => {
            const { match, host, guest } = matchContext;
            const winnerId = host.user.id;
            const loserId = guest.user.id;

            const winnerBefore = await User.findByPk(winnerId);
            const eloBefore = winnerBefore.elo_rating;

            const spamRequests = Array.from({ length: 50 }).map(() => 
                matchStatusService.registrarVictoria(match.id, winnerId)
            );

            await Promise.all(spamRequests);

            const partidaActualizada = await MatchDao.findById(match.id);
            expect(partidaActualizada.status).toBe('FINISHED');

            const winnerAfter = await User.findByPk(winnerId);
            expect(winnerAfter.elo_rating).toBe(eloBefore + 16);
        });
    });
});