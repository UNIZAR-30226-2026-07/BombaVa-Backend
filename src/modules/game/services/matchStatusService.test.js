/**
 * Test Unitario: Servicio de Estado de Partida
 * Valida la lógica de victoria y derrota aislando los modelos de base de datos.
 */
import { jest } from '@jest/globals';

const countMock = jest.fn();

jest.unstable_mockModule('../../../shared/models/index.js', () => ({
    ShipInstance: { count: countMock },
    Match: { update: jest.fn(), findByPk: jest.fn() },
    MatchPlayer: {},
    Projectile: {},
    User: {},
    UserShip: {},
    ShipTemplate: {},
    FleetDeck: {},
    sequelize: {},
    syncModels: jest.fn()
}));

const { verificarDerrotaJugador } = await import('./matchStatusService.js');

describe('MatchStatusService Unit Tests', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('verificarDerrotaJugador - Debe devolver true si count es 0', async () => {
        countMock.mockResolvedValue(0);

        const result = await verificarDerrotaJugador('m1', 'p1');

        expect(result).toBe(true);
        expect(countMock).toHaveBeenCalledWith(expect.objectContaining({
            where: { matchId: 'm1', playerId: 'p1', isSunk: false }
        }));
    });

    it('verificarDerrotaJugador - Debe devolver false si hay barcos vivos', async () => {
        countMock.mockResolvedValue(2);

        const result = await verificarDerrotaJugador('m1', 'p1');

        expect(result).toBe(false);
    });
});