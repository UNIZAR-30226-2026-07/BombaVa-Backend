import { validationResult } from 'express-validator';
import { Match, MatchPlayer, sequelize, ShipInstance } from '../../../shared/models/index.js';
import { checkWinCondition } from '../../game/controllers/matchStatusController.js';
import * as combatService from '../services/combatService.js';

/**
 * Endpoint para disparar el cañón (Capa de API)
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

        if (!barco || barco.lastAttackTurn === partida.turnNumber || jugador.ammoCurrent < 2) {
            await transaccion.rollback();
            return res.status(403).json({ message: 'Acción no permitida' });
        }

        if (!combatService.validarRangoAtaque({ x: barco.x, y: barco.y }, target, 4)) {
            await transaccion.rollback();
            return res.status(400).json({ message: 'Fuera de rango' });
        }

        const objetivo = await ShipInstance.findOne({ where: { matchId, x: target.x, y: target.y, isSunk: false }, transaction: transaccion });
        let victoria = false;

        if (objetivo) {
            objetivo.currentHp = Math.max(0, objetivo.currentHp - combatService.calcularDañoImpacto('CANNON'));
            if (objetivo.currentHp === 0) objetivo.isSunk = true;
            await objetivo.save({ transaction: transaccion });
            victoria = await checkWinCondition(matchId, objetivo.playerId);
        }

        jugador.ammoCurrent -= 2;
        barco.lastAttackTurn = partida.turnNumber;
        await Promise.all([jugador.save({ transaction: transaccion }), barco.save({ transaction: transaccion })]);
        await transaccion.commit();

        res.json({ hit: !!objetivo, matchFinished: victoria, targetHp: objetivo ? objetivo.currentHp : null, ammoCurrent: jugador.ammoCurrent });
    } catch (error) {
        if (transaccion) await transaccion.rollback();
        next(error);
    }
};