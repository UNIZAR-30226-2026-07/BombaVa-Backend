import { jest } from '@jest/globals';
import { Match, MatchPlayer, Projectile, sequelize, ShipInstance } from '../../../shared/models/index.js';
import { dropMine, launchTorpedo } from './projectileController.js';

describe('ProjectileController Unit Tests', () => {
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

    it('Debe crear un proyectil de tipo TORPEDO con dirección correcta', async () => {
        req.body = { shipId: 's1' };

        const barcoMock = { x: 5, y: 5, orientation: 'N', save: jest.fn() };
        const jugadorMock = { ammoCurrent: 5, save: jest.fn() };

        jest.spyOn(Match, 'findByPk').mockResolvedValue({ turnNumber: 1 });
        jest.spyOn(ShipInstance, 'findByPk').mockResolvedValue(barcoMock);
        jest.spyOn(MatchPlayer, 'findOne').mockResolvedValue(jugadorMock);
        jest.spyOn(Projectile, 'create').mockResolvedValue({});

        await launchTorpedo(req, res, next);

        expect(Projectile.create).toHaveBeenCalledWith(
            expect.objectContaining({ type: 'TORPEDO', vectorY: -1 }),
            expect.anything()
        );
        expect(jugadorMock.ammoCurrent).toBe(2);
    });

    it('Debe rechazar una mina colocada a más de 1 casilla de distancia', async () => {
        req.body = { shipId: 's1', target: { x: 8, y: 8 } };

        const barcoMock = { x: 5, y: 5 };
        const jugadorMock = { ammoCurrent: 5 };

        jest.spyOn(Match, 'findByPk').mockResolvedValue({ turnNumber: 1 });
        jest.spyOn(ShipInstance, 'findByPk').mockResolvedValue(barcoMock);
        jest.spyOn(MatchPlayer, 'findOne').mockResolvedValue(jugadorMock);

        await dropMine(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
    });
});