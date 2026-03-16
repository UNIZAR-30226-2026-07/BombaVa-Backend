import EngineDao from '../../../modules/engine/dao/EngineDao.js';
import { createCompleteMatch, createMatchWithInstance } from '../../../shared/models/testFactory.js';
describe('EngineDao', () => {
    let matchContext;

    beforeAll(async () => {
        matchContext = await createCompleteMatch(
            { username: 'player1', email: 'p1@test.com' },
            { username: 'player2', email: 'p2@test.com' }
        );
    });

    describe('Busquedas', () => {
        it('debe encontrar todos los barcos de un jugador por su ID', async () => {
            const { host, shipH } = matchContext;
            
            const ships = await EngineDao.findByPlayerId(host.user.id);
            
            expect(ships.length).toBeGreaterThan(0);
            expect(ships[0].id).toBe(shipH.id);
        });

        it('debe encontrar la flota de un jugador en una partida específica', async () => {
            const { match, host, shipH } = matchContext;
            
            const ships = await EngineDao.findByMatchAndPlayer(match.id, host.user.id);
            
            expect(ships.length).toBe(1);
            expect(ships[0].id).toBe(shipH.id);
            expect(ships[0].matchId).toBe(match.id);
        });

        it('debe encontrar un barco específico por su ID', async () => {
            const { shipH } = matchContext;
            
            const foundShip = await EngineDao.findById(shipH.id);
            
            expect(foundShip).not.toBeNull();
            expect(foundShip.id).toBe(shipH.id);
        });

        it('debe contar los barcos vivos de un jugador', async () => {
            const { match, host } = matchContext;
            
            const aliveCount = await EngineDao.countAliveShips(match.id, host.user.id);
            
            expect(aliveCount).toBe(1);
        });
    });

    describe('Lógica de Combate ', () => {
        it('debe registrar un impacto correctamente', async () => {
            const { shipG } = matchContext;
            const hitCells = [{ x: 5, y: 7 }];
            const newHp = shipG.currentHp - 10;
            
            const updatedShip = await EngineDao.registerHit(shipG.id, newHp, hitCells, false);
            
            expect(updatedShip.currentHp).toBe(newHp);
            expect(updatedShip.hitCells).toEqual(hitCells);
            expect(updatedShip.isSunk).toBe(false);
        });

        it('debe actualizar el turno del último ataque', async () => {
            const { shipH } = matchContext;
            const currentTurn = 5;
            
            await EngineDao.updateLastAttackTurn(shipH.id, currentTurn);
            
            const verifiedShip = await EngineDao.findById(shipH.id);
            expect(verifiedShip.lastAttackTurn).toBe(currentTurn);
        });
    });

    describe('Ciclo de Vida ', () => {
        it('debe crear una flota entera (bulkCreate)', async () => {
            const { match, host } = matchContext;
            // Preparamos datos simulados para una flota
            const fleetData = [
                {
                    matchId: match.id,
                    playerId: host.user.id,
                    userShipId: host.uShip.id,
                    x: 1, y: 1, orientation: 'E',
                    currentHp: 20
                },
                {
                    matchId: match.id,
                    playerId: host.user.id,
                    userShipId: host.uShip.id,
                    x: 2, y: 2, orientation: 'S',
                    currentHp: 30
                }
            ];

            const createdFleet = await EngineDao.createFleet(fleetData);
            
            expect(createdFleet.length).toBe(2);
            expect(createdFleet[0].x).toBe(1);
            expect(createdFleet[1].x).toBe(2);
        });

        it('debe eliminar todos los barcos de una partida', async () => {
            const isolatedContext = await createMatchWithInstance('del_user', 'del@test.com');
            const { match, user } = isolatedContext;

            let currentShips = await EngineDao.findByMatchAndPlayer(match.id, user.id);
            expect(currentShips.length).toBe(1);
            await EngineDao.deleteByMatchId(match.id);
            currentShips = await EngineDao.findByMatchAndPlayer(match.id, user.id);
            expect(currentShips.length).toBe(0);
        });
    });
});