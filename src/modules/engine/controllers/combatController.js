/**
 * Controlador de Combate
 * Orquesta las peticiones de ataque delegando la lógica en el combatService.
 */
import { validationResult } from 'express-validator';
import { Match, MatchPlayer, ShipInstance, sequelize } from '../../../shared/models/index.js';
import * as combatService from '../services/combatService.js';

/**
 * Ejecuta un disparo de cañón
 */
export const fireCannon = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const transaccion = await sequelize.transaction();
    try {
        const { matchId } = req.params;
        const { shipId, target } = req.body;
        const costes = combatService.obtenerCostesCombate();

        const partida = await Match.findByPk(matchId, { transaction: transaccion });
        const barco = await ShipInstance.findByPk(shipId, { transaction: transaccion });
        const jugador = await MatchPlayer.findOne({ where: { matchId, userId: req.user.id }, transaction: transaccion });

        if (!barco || !partida || !jugador) {
            await transaccion.rollback();
            return res.status(404).json({ message: 'Entidades no encontradas' });
        }

        if (barco.lastAttackTurn === partida.turnNumber || jugador.ammoCurrent < costes.CANNON) {
            await transaccion.rollback();
            return res.status(403).json({ message: 'Ataque no disponible o munición insuficiente' });
        }

        if (!combatService.validarRangoAtaque({ x: barco.x, y: barco.y }, target, 4)) {
            await transaccion.rollback();
            return res.status(400).json({ message: 'Fuera de rango' });
        }

        const objetivo = await ShipInstance.findOne({
            where: { matchId, x: target.x, y: target.y, isSunk: false },
            transaction: transaccion
        });

        let targetHp = null;
        if (objetivo) {
            await combatService.aplicarDañoImpacto(objetivo, 'CANNON', transaccion);
            targetHp = objetivo.currentHp;
        }

        jugador.ammoCurrent -= costes.CANNON;
        barco.lastAttackTurn = partida.turnNumber;

        await Promise.all([barco.save({ transaction: transaccion }), jugador.save({ transaction: transaccion })]);
        await transaccion.commit();

        res.json({ hit: !!objetivo, ammoCurrent: jugador.ammoCurrent, targetHp });
    } catch (error) {
        if (transaccion) await transaccion.rollback();
        next(error);
    }
};