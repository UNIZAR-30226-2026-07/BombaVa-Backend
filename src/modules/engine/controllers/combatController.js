import { validationResult } from 'express-validator';
import { Match, MatchPlayer, Projectile, sequelize, ShipInstance } from '../../../shared/models/index.js';

/**
 * Ejecuta un ataque de cañón instantáneo sobre una coordenada
 * @param {object} req - Petición con matchId, shipId y target {x, y}
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

        if (barco.lastAttackTurn === partida.turnNumber) {
            await transaccion.rollback();
            return res.status(403).json({ message: 'Este barco ya ha atacado en este turno' });
        }

        if (jugador.ammoCurrent < 2) {
            await transaccion.rollback();
            return res.status(403).json({ message: 'Munición insuficiente (Requiere 2 AP)' });
        }

        const distancia = Math.sqrt(Math.pow(target.x - barco.x, 2) + Math.pow(target.y - barco.y, 2));
        if (distancia > 4) {
            await transaccion.rollback();
            return res.status(400).json({ message: 'Objetivo fuera de rango (Máximo 4 casillas)' });
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
        await transaccion.rollback();
        next(error);
    }
};

/**
 * Lanza un torpedo que se desplazará en turnos posteriores
 * @param {object} req - Petición con matchId y shipId
 * @param {object} res - Confirmación del lanzamiento
 * @param {function} next - Middleware de error
 */
export const launchTorpedo = async (req, res, next) => {
    const transaccion = await sequelize.transaction();
    try {
        const { matchId } = req.params;
        const { shipId } = req.body;

        const partida = await Match.findByPk(matchId, { transaction: transaccion });
        const barco = await ShipInstance.findByPk(shipId, { transaction: transaccion });
        const jugador = await MatchPlayer.findOne({ where: { matchId, userId: req.user.id }, transaction: transaccion });

        if (jugador.ammoCurrent < 3) {
            await transaccion.rollback();
            return res.status(403).json({ message: 'Munición insuficiente (Requiere 3 AP)' });
        }

        let vx = 0, vy = 0;
        if (barco.orientation === 'N') vy = -1;
        if (barco.orientation === 'S') vy = 1;
        if (barco.orientation === 'E') vx = 1;
        if (barco.orientation === 'W') vx = -1;

        await Projectile.create({
            matchId,
            ownerId: req.user.id,
            type: 'TORPEDO',
            x: barco.x + vx,
            y: barco.y + vy,
            vectorX: vx,
            vectorY: vy,
            lifeDistance: 6
        }, { transaction: transaccion });

        jugador.ammoCurrent -= 3;
        barco.lastAttackTurn = partida.turnNumber;

        await jugador.save({ transaction: transaccion });
        await barco.save({ transaction: transaccion });

        await transaccion.commit();
        res.json({ message: 'Torpedo lanzado', ammoCurrent: jugador.ammoCurrent });
    } catch (error) {
        await transaccion.rollback();
        next(error);
    }
};