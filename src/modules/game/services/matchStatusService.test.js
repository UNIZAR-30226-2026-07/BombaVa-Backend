/**
 * Test Unitario: Servicio de Estado de Partida
 * Valida la lógica de victoria y derrota aislando los modelos.
 */
import * as matchStatusService from '../../../modules/game/services/matchStatusService.js';
import MatchDao from '../../../modules/game/dao/MatchDao.js';
import EngineDao from '../../../modules/engine/dao/EngineDao.js';
import { createCompleteMatch } from '../../../shared/models/testFactory.js'; 
import { sequelize } from '../../../config/db.js';

describe('MatchStatusService', () => {
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
        it('debe devolver false si al jugador le quedan barcos vivos', async () => {
            const { match, host } = matchContext;
            
            const estaDerrotado = await matchStatusService.verificarDerrotaJugador(match.id, host.user.id);
            
            expect(estaDerrotado).toBe(false);
        });

        it('debe devolver true si el jugador NO tiene barcos vivos', async () => {
            const { match, guest, shipG } = matchContext;
            
            await EngineDao.registerHit(shipG.id, 0, [{x: 5, y: 7}], true);
            
            const estaDerrotado = await matchStatusService.verificarDerrotaJugador(match.id, guest.user.id);
            
            expect(estaDerrotado).toBe(true);
        });
    });

    describe('registrarVictoria', () => {
        it('debe procesar el ELO real en la BD y finalizar la partida', async () => {
            const { match, host } = matchContext;
            const winnerId = host.user.id;

            await matchStatusService.registrarVictoria(match.id, winnerId);

            const partidaActualizada = await MatchDao.findById(match.id);
            expect(partidaActualizada.status).toBe('FINISHED');
            
        });

        it('no debe romper la ejecución si la partida no existe', async () => {
            const fakeMatchId = '00000000-0000-0000-0000-000000000000';
            
            await expect(matchStatusService.registrarVictoria(fakeMatchId, 'fake-winner-id'))
                .resolves.not.toThrow();
        });
    });

    describe('finalizarPartida', () => {
        it('debe no fallar ni alterar el estado si se intenta finalizar una partida que ya está FINISHED', async () => {
            const { match } = matchContext;
            
            await matchStatusService.finalizarPartida(match.id);
            
            const partidaActualizada = await MatchDao.findById(match.id);
            expect(partidaActualizada.status).toBe('FINISHED');
        });
    });
});