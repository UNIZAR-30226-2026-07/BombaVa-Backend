import { validationResult } from 'express-validator';
import { MatchPlayer, sequelize, ShipInstance } from '../../../shared/models/index.js';
import * as engineService from '../services/engineService.js';

/**
 * Endpoint de la API para mover un barco
 */
export const moveShip = async (req, res, next) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) return res.status(400).json({ errors: errores.array() });

    const transaccion = await sequelize.transaction();
    try {
        const { matchId } = req.params;
        const { shipId, direction } = req.body;

        const barco = await ShipInstance.findByPk(shipId, { transaction: transaccion });
        const jugador = await MatchPlayer.findOne({ where: { matchId, userId: req.user.id }, transaction: transaccion });

        if (!barco || !jugador) {
            await transaccion.rollback();
            return res.status(404).json({ message: 'No encontrado' });
        }

        const nuevaPos = engineService.calcularTraslacion({ x: barco.x, y: barco.y }, direction);

        if (!engineService.validarLimitesMapa(nuevaPos.x, nuevaPos.y)) {
            await transaccion.rollback();
            return res.status(400).json({ message: 'Fuera de límites' });
        }

        if (jugador.fuelReserve < 1) {
            await transaccion.rollback();
            return res.status(403).json({ message: 'Sin combustible' });
        }

        barco.x = nuevaPos.x;
        barco.y = nuevaPos.y;
        jugador.fuelReserve -= 1;

        await barco.save({ transaction: transaccion });
        await jugador.save({ transaction: transaccion });
        await transaccion.commit();

        res.json({ fuelReserve: jugador.fuelReserve, position: { x: barco.x, y: barco.y } });
    } catch (error) {
        if (transaccion) await transaccion.rollback();
        next(error);
    }
};

/**
 * Endpoint de la API para rotar un barco
 */
export const rotateShip = async (req, res, next) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) return res.status(400).json({ errors: errores.array() });

    const transaccion = await sequelize.transaction();
    try {
        const { matchId } = req.params;
        const { shipId, degrees } = req.body;

        const barco = await ShipInstance.findByPk(shipId, { transaction: transaccion });
        const jugador = await MatchPlayer.findOne({ where: { matchId, userId: req.user.id }, transaction: transaccion });

        if (jugador.fuelReserve < 2) {
            await transaccion.rollback();
            return res.status(403).json({ message: 'Sin combustible' });
        }

        barco.orientation = engineService.calcularRotacion(barco.orientation, degrees);
        jugador.fuelReserve -= 2;

        await barco.save({ transaction: transaccion });
        await jugador.save({ transaction: transaccion });
        await transaccion.commit();

        res.json({ fuelReserve: jugador.fuelReserve, orientation: barco.orientation });
    } catch (error) {
        if (transaccion) await transaccion.rollback();
        next(error);
    }
};