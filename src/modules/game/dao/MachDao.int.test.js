

import MatchDao from './MatchDao.js';
import { createCompleteMatch } from '../../../shared/models/testFactory.js'; 
import { sequelize } from '../../../config/db.js';

describe('MatchDao', () => {
    let matchContext;

    beforeAll(async () => {
        await sequelize.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
        await sequelize.sync({ force: true });
        matchContext = await createCompleteMatch(
            { username: 'host_match_dao', email: 'host_m@test.com' },
            { username: 'guest_match_dao', email: 'guest_m@test.com' }
        );
    });

    afterAll(async () => {
            await sequelize.close();
    });

    describe('Creacion', () => {
        it('debe crear una nueva partida en estado WAITING', async () => {
            const mapTerrain = { size: 15, obstacles: [] };
            const newMatch = await MatchDao.createMatch();
            
            expect(newMatch).not.toBeNull();
            expect(newMatch.status).toBe('WAITING');
            expect(newMatch.mapTerrain).toEqual(mapTerrain);
            expect(newMatch.turnNumber).toBe(1);
        });
    });

    describe('Busquedas', () => {
        it('debe buscar una partida por su ID', async () => {
            const { match } = matchContext;
            const foundMatch = await MatchDao.findById(match.id);
            
            expect(foundMatch).not.toBeNull();
            expect(foundMatch.id).toBe(match.id);
            expect(foundMatch.status).toBe('PLAYING');
        });

        it('debe encontrar partidas que están esperando jugadores', async () => {

            await MatchDao.createMatch();
            
            const waitingMatches = await MatchDao.findWaitingMatches();
            console.log(waitingMatches);
            expect(waitingMatches.length).toBeGreaterThan(0);
            expect(waitingMatches[0].status).toBe('WAITING');
        });
    });

    describe('Actualizaciones', () => {
        it('debe actualizar el estado de la partida', async () => {
            const { match } = matchContext;
            
            const updatedMatch = await MatchDao.updateStatus(match.id, 'FINISHED');
            expect(updatedMatch.status).toBe('FINISHED');
        });

        it('debe avanzar el turno y cambiar el jugador actual', async () => {
            const { match, guest } = matchContext;
            const nextTurn = 2;
            const expiresAt = new Date();

            const updatedMatch = await MatchDao.advanceTurn(
                match.id, 
                guest.user.id, 
                nextTurn, 
            );
            
            expect(updatedMatch.turnNumber).toBe(nextTurn);
            expect(updatedMatch.currentTurnPlayerId).toBe(guest.user.id);
        });
    });
});