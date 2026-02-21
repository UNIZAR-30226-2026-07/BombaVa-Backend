import { validationResult } from 'express-validator';
import { Match, MatchPlayer, sequelize, ShipInstance } from '../../../shared/models/index.js';

/**
 * Procesa un ataque de cañón con resolución de daño inmediata
 * @param {object} req - Petición con coordenadas del objetivo
 * @param {object} res - Resultado del impacto
 * @param {function} next - Middleware de error
 */
export const fireCannon = async (req, res, next) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) return res.status(400).json({ errors: errores.array() });

    const transaccion = await sequelize.transaction();
    try {
        const { matchId } = req.params;
        const { shipId, target } = req.body;

        const partida = await Match.findByPk(matchId, { transaction: transaccion });
        const barco = await ShipInstance.findByPk(shipId, { transaction: transaccion });
        const jugador = await MatchPlayer.findOne({ where: { matchId, userId: req.user.id }, transaction: transaccion });

        if (!barco || barco.lastAttackTurn === partida.turnNumber) {
            await transaccion.rollback();
            return res.status(403).json({ message: 'Acción no permitida o barco ya ha atacado' });
        }

        if (jugador.ammoCurrent < 2) {
            await transaccion.rollback();
            return res.status(403).json({ message: 'Munición insuficiente' });
        }

        const distancia = Math.sqrt(Math.pow(target.x - barco.x, 2) + Math.pow(target.y - barco.y, 2));
        if (distancia > 4) {
            await transaccion.rollback();
            return res.status(400).json({ message: 'Fuera de rango' });
        }

        const objetivo = await ShipInstance.findOne({
            where: { matchId, x: target.x, y: target.y, isSunk: false },
            transaction: transaccion
        });

        let impacto = false;
        if (objetivo) {
            objetivo.currentHp = Math.max(0, objetivo.currentHp - 10);
            if (objetivo.currentHp === 0) objetivo.isSunk = true;
            await objetivo.save({ transaction: transaccion });
            impacto = true;
        }

        jugador.ammoCurrent -= 2;
        barco.lastAttackTurn = partida.turnNumber;

        await jugador.save({ transaction: transaccion });
        await barco.save({ transaction: transaccion });

        await transaccion.commit();
        res.json({ hit: impacto, ammoCurrent: jugador.ammoCurrent, targetHp: objetivo ? objetivo.currentHp : null });
    } catch (error) {
        if (transaccion) await transaccion.rollback();
        next(error);
    }
};