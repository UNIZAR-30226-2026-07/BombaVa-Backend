/**
 * Controlador de Combate
 * Gestiona los ataques directos de cañón.
 */
import { validationResult } from 'express-validator';
import { Match, MatchPlayer, ShipInstance, sequelize } from '../../../shared/models/index.js';

/**
 * Ejecuta un ataque de cañón consumiendo 2 AP
 */
export const fireCannon = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const transaccion = await sequelize.transaction();
    try {
        const { matchId } = req.params;
        const { shipId, target } = req.body;
        const COST_AP = 2;

        const partida = await Match.findByPk(matchId, { transaction: transaccion });
        const barco = await ShipInstance.findByPk(shipId, { transaction: transaccion });
        const jugador = await MatchPlayer.findOne({ where: { matchId, userId: req.user.id }, transaction: transaccion });

        if (!barco || !partida || !jugador) {
            await transaccion.rollback();
            return res.status(403).json({ message: 'Ataque no disponible o recursos insuficientes' });
        }

        if (barco.lastAttackTurn === partida.turnNumber || jugador.ammoCurrent < COST_AP) {
            await transaccion.rollback();
            return res.status(403).json({ message: 'Ataque no disponible o recursos insuficientes' });
        }

        const objetivo = await ShipInstance.findOne({
            where: { matchId, x: target.x, y: target.y, isSunk: false },
            transaction: transaccion
        });

        let targetHp = null;
        if (objetivo) {
            objetivo.currentHp = Math.max(0, objetivo.currentHp - 10);
            if (objetivo.currentHp === 0) objetivo.isSunk = true;
            await objetivo.save({ transaction: transaccion });
            targetHp = objetivo.currentHp;
        }

        jugador.ammoCurrent -= COST_AP;
        barco.lastAttackTurn = partida.turnNumber;

        await Promise.all([barco.save({ transaction: transaccion }), jugador.save({ transaction: transaccion })]);
        await transaccion.commit();

        res.json({ hit: !!objetivo, ammoCurrent: jugador.ammoCurrent, targetHp });
    } catch (error) {
        if (transaccion) await transaccion.rollback();
        next(error);
    }
};