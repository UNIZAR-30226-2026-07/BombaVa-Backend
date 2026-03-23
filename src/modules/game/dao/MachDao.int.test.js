

import MatchDao from './MatchDao.js';
import { createCompleteMatch, createUser } from '../../../shared/models/testFactory.js'; 
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
        it('debe crear una nueva partida en estado PLAYING', async () => {
            const mapTerrain = { size: 15, obstacles: [] };
            const newMatch = await MatchDao.createMatch("f7cdd8ee-c849-4681-a684-2050f56957be");
            
            expect(newMatch).not.toBeNull();
            expect(newMatch.status).toBe('PLAYING');
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

    describe('Busquedas', () => {
            it('debe obtener todos los jugadores de una partida', async () => {
                const { match } = matchContext;
                
                const players = await MatchDao.findPlayersByMatch(match.id);
                expect(players.length).toBe(2);
                const sides = players.map(p => p.side);
                expect(sides).toContain('NORTH');
                expect(sides).toContain('SOUTH');
            });
    
            it('debe obtener la información de un jugador concreto usando su userId', async () => {
                const { match, host } = matchContext;
                
                const player = await MatchDao.findMatchPlayer(match.id, host.user.id);
                
                expect(player).not.toBeNull();
                expect(player.userId).toBe(host.user.id);
                expect(player.side).toBe('NORTH');
            });
        });
    
        describe('Actualizaciones', () => {
            it('debe actualizar los recursos de un jugador (combustible y munición)', async () => {
                const { match, host } = matchContext;
                
                const player = await MatchDao.findMatchPlayer(match.id, host.user.id);
                
                const newFuel = player.fuelReserve - 10;
                const newAmmo = player.ammoCurrent - 2;
                const updatedPlayer = await MatchDao.updateResources(player.id, newFuel, newAmmo);
                
                expect(updatedPlayer.fuelReserve).toBe(newFuel);
                expect(updatedPlayer.ammoCurrent).toBe(newAmmo);
            });
        });
    
        describe('Creacion', () => {
            it('debe añadir un jugador a una nueva partida con su mazo', async () => {
                const newMatch = await MatchDao.createMatch("f7cdd8ee-c849-4681-a684-2050f56957be");
                
                const newUser = await createUser('lonely_player', 'lonely@test.com');
                
                const deckSnapshot = { name: "Mazo Destructor", ships: [] };
    
                const newMatchPlayer = await MatchDao.createPlayer(
                    newMatch.id,
                    newUser.id,
                    'SOUTH',
                    deckSnapshot
                );
    
                expect(newMatchPlayer).not.toBeNull();
                expect(newMatchPlayer.matchId).toBe(newMatch.id);
                expect(newMatchPlayer.userId).toBe(newUser.id);
                expect(newMatchPlayer.side).toBe('SOUTH');
                expect(newMatchPlayer.deckSnapshot).toEqual(deckSnapshot);
                expect(newMatchPlayer.fuelReserve).toBeDefined();
                expect(newMatchPlayer.ammoCurrent).toBeDefined();
            });
        });
});