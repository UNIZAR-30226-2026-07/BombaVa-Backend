import { jest } from '@jest/globals';
import { MatchPlayer, sequelize, ShipInstance } from '../../../shared/models/index.js';
import { moveShip, rotateShip } from './movementController.js';

describe('MovementController Unit Tests', () => {
    let req, res, next;

    beforeEach(() => {
        req = { params: { matchId: 'm1' }, body: {}, user: { id: 'u1' } };
        res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
        next = jest.fn();

        jest.spyOn(sequelize, 'transaction').mockResolvedValue({
            commit: jest.fn(),
            rollback: jest.fn()
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('Debe mover el barco al norte y descontar 1 MP', async () => {
        req.body = { shipId: 's1', direction: 'N' };

        const barcoMock = { id: 's1', x: 5, y: 5, save: jest.fn() };
        const jugadorMock = { userId: 'u1', fuelReserve: 10, save: jest.fn() };

        jest.spyOn(ShipInstance, 'findByPk').mockResolvedValue(barcoMock);
        jest.spyOn(MatchPlayer, 'findOne').mockResolvedValue(jugadorMock);

        await moveShip(req, res, next);

        expect(barcoMock.y).toBe(4);
        expect(jugadorMock.fuelReserve).toBe(9);
        expect(res.json).toHaveBeenCalled();
    });

    it('Debe fallar si el movimiento sale del mapa (y < 0)', async () => {
        req.body = { shipId: 's1', direction: 'N' };

        const barcoMock = { id: 's1', x: 0, y: 0, save: jest.fn() };
        const jugadorMock = { userId: 'u1', fuelReserve: 10, save: jest.fn() };

        jest.spyOn(ShipInstance, 'findByPk').mockResolvedValue(barcoMock);
        jest.spyOn(MatchPlayer, 'findOne').mockResolvedValue(jugadorMock);

        await moveShip(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('Debe rotar 90 grados y descontar 2 MP', async () => {
        req.body = { shipId: 's1', degrees: 90 };

        const barcoMock = { id: 's1', orientation: 'N', save: jest.fn() };
        const jugadorMock = { userId: 'u1', fuelReserve: 10, save: jest.fn() };

        jest.spyOn(ShipInstance, 'findByPk').mockResolvedValue(barcoMock);
        jest.spyOn(MatchPlayer, 'findOne').mockResolvedValue(jugadorMock);

        await rotateShip(req, res, next);

        expect(barcoMock.orientation).toBe('E');
        expect(jugadorMock.fuelReserve).toBe(8);
    });
});