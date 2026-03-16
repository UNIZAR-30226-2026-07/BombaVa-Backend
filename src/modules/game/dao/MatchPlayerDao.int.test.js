
import { sequelize } from '../../../config/db.js';
import MatchPlayerDao from './MatchPlayerDao.js';
import MatchDao from './MatchDao.js';
import { createCompleteMatch, createUser } from '../../../shared/models/testFactory.js';

describe('MatchPlayerDao', () => {
    let matchContext;

    beforeAll(async () => {
        await sequelize.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
        await sequelize.sync({ force: true });
        matchContext = await createCompleteMatch(
            { username: 'host_mp_dao', email: 'host_mp@test.com' },
            { username: 'guest_mp_dao', email: 'guest_mp@test.com' }
        );
    });

    afterAll(async () => {
            await sequelize.close();
    });

    describe('Busquedas', () => {
        it('debe obtener todos los jugadores de una partida', async () => {
            const { match } = matchContext;
            
            const players = await MatchPlayerDao.findPlayersByMatch(match.id);
            
            expect(players.length).toBe(2);
            const sides = players.map(p => p.side);
            expect(sides).toContain('NORTH');
            expect(sides).toContain('SOUTH');
        });

        it('debe obtener la información de un jugador concreto usando su userId', async () => {
            const { match, host } = matchContext;
            
            const player = await MatchPlayerDao.findMatchPlayer(match.id, host.user.id);
            
            expect(player).not.toBeNull();
            expect(player.userId).toBe(host.user.id);
            expect(player.side).toBe('NORTH');
        });
    });

    describe('Actualizaciones', () => {
        it('debe actualizar los recursos de un jugador (combustible y munición)', async () => {
            const { match, host } = matchContext;
            
            const player = await MatchPlayerDao.findMatchPlayer(match.id, host.user.id);
            
            const newFuel = player.fuelReserve - 10;
            const newAmmo = player.ammoCurrent - 2;
            const updatedPlayer = await MatchPlayerDao.updateResources(player.id, newFuel, newAmmo);
            
            expect(updatedPlayer.fuelReserve).toBe(newFuel);
            expect(updatedPlayer.ammoCurrent).toBe(newAmmo);
        });
    });

    describe('Creacion', () => {
        it('debe añadir un jugador a una nueva partida con su mazo', async () => {
            const newMatch = await MatchDao.createMatch({ size: 15 });
            
            const newUser = await createUser('lonely_player', 'lonely@test.com');
            
            const deckSnapshot = { name: "Mazo Destructor", ships: [] };

            const newMatchPlayer = await MatchPlayerDao.createPlayer(
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