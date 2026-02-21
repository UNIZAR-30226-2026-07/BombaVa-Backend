import { validationResult } from 'express-validator';
import { MatchPlayer, sequelize, ShipInstance } from '../../../shared/models/index.js';

/**
 * Procesa el movimiento de traslación de un barco y descuenta el combustible
 * @param {object} req - Petición con matchId, shipId y direction
 * @param {object} res - Respuesta con el nuevo estado de recursos y posición
 * @param {function} next - Middleware de error
 */
export const moveShip = async (req, res, next) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
        return res.status(400).json({ errors: errores.array() });
    }

    const transaccion = await sequelize.transaction();
    try {
        const { matchId } = req.params;
        const { shipId, direction } = req.body;

        const barco = await ShipInstance.findByPk(shipId, { transaction: transaccion });
        const jugador = await MatchPlayer.findOne({
            where: { matchId, userId: req.user.id },
            transaction: transaccion
        });

        if (!barco || !jugador) {
            await transaccion.rollback();
            return res.status(404).json({ message: 'Recursos de partida no encontrados' });
        }

        if (jugador.fuelReserve < 1) {
            await transaccion.rollback();
            return res.status(403).json({ message: 'Combustible insuficiente (MP)' });
        }

        if (direction === 'N') barco.y -= 1;
        if (direction === 'S') barco.y += 1;
        if (direction === 'E') barco.x += 1;
        if (direction === 'W') barco.x -= 1;

        if (barco.x < 0 || barco.x > 14 || barco.y < 0 || barco.y > 14) {
            await transaccion.rollback();
            return res.status(400).json({ message: 'Movimiento fuera de los límites del mapa' });
        }

        jugador.fuelReserve -= 1;

        await barco.save({ transaction: transaccion });
        await jugador.save({ transaction: transaccion });

        await transaccion.commit();
        res.json({ fuelReserve: jugador.fuelReserve, position: { x: barco.x, y: barco.y } });
    } catch (error) {
        await transaccion.rollback();
        next(error);
    }
};

/**
 * Procesa la rotación de un barco y descuenta 2 MP del combustible
 * @param {object} req - Petición con matchId, shipId y degrees
 * @param {object} res - Respuesta con la nueva orientación
 * @param {function} next - Middleware de error
 */
export const rotateShip = async (req, res, next) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
        return res.status(400).json({ errors: errores.array() });
    }

    const transaccion = await sequelize.transaction();
    try {
        const { matchId } = req.params;
        const { shipId, degrees } = req.body;

        const barco = await ShipInstance.findByPk(shipId, { transaction: transaccion });
        const jugador = await MatchPlayer.findOne({
            where: { matchId, userId: req.user.id },
            transaction: transaccion
        });

        if (jugador.fuelReserve < 2) {
            await transaccion.rollback();
            return res.status(403).json({ message: 'Combustible insuficiente para rotar (2 MP)' });
        }

        const orientaciones = ['N', 'E', 'S', 'W'];
        let indexActual = orientaciones.indexOf(barco.orientation);

        if (degrees === 90) indexActual = (indexActual + 1) % 4;
        else indexActual = (indexActual + 3) % 4;

        barco.orientation = orientaciones[indexActual];
        jugador.fuelReserve -= 2;

        await barco.save({ transaction: transaccion });
        await jugador.save({ transaction: transaccion });

        await transaccion.commit();
        res.json({ fuelReserve: jugador.fuelReserve, orientation: barco.orientation });
    } catch (error) {
        await transaccion.rollback();
        next(error);
    }
};