import { validationResult } from 'express-validator';
import { Match, MatchPlayer, sequelize, ShipInstance } from '../../../shared/models/index.js';
import { checkWinCondition } from '../../game/controllers/matchStatusController.js';

/**
 * Procesa el disparo de cañón, calcula daños y verifica condiciones de victoria
 * @param {object} req - Petición con matchId, shipId y target {x, y}
 * @param {object} res - Respuesta con impacto, vida restante y munición
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
            return res.status(403).json({ message: 'Acción no permitida o el barco ya ha atacado' });
        }

        const objetivo = await ShipInstance.findOne({
            where: { matchId, x: target.x, y: target.y, isSunk: false },
            transaction: transaccion
        });

        let victoriaDetectada = false;
        if (objetivo) {
            objetivo.currentHp = Math.max(0, objetivo.currentHp - 10);
            if (objetivo.currentHp === 0) objetivo.isSunk = true;
            await objetivo.save({ transaction: transaccion });
            victoriaDetectada = await checkWinCondition(matchId, objetivo.playerId);
        }

        jugador.ammoCurrent -= 2;
        barco.lastAttackTurn = partida.turnNumber;
        await jugador.save({ transaction: transaccion });
        await barco.save({ transaction: transaccion });

        await transaccion.commit();
        res.json({
            hit: !!objetivo,
            matchFinished: victoriaDetectada,
            targetHp: objetivo ? objetivo.currentHp : null,
            ammoCurrent: jugador.ammoCurrent
        });
    } catch (error) {
        if (transaccion) await transaccion.rollback();
        next(error);
    }
};