import { Match, MatchPlayer, Projectile, sequelize, ShipInstance } from '../../../shared/models/index.js';

/**
 * Lanza un torpedo desde la proa del barco (Coste 3 AP)
 * @param {object} req - Petición Express
 * @param {object} res - Respuesta Express
 * @param {function} next - Siguiente middleware
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
            return res.status(403).json({ message: 'Munición insuficiente (3 AP)' });
        }

        let vx = 0, vy = 0;
        if (barco.orientation === 'N') vy = -1;
        else if (barco.orientation === 'S') vy = 1;
        else if (barco.orientation === 'E') vx = 1;
        else if (barco.orientation === 'W') vx = -1;

        await Projectile.create({
            matchId, ownerId: req.user.id, type: 'TORPEDO',
            x: barco.x + vx, y: barco.y + vy,
            vectorX: vx, vectorY: vy, lifeDistance: 6
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

/**
 * Coloca una mina en un radio adyacente al barco (Coste 2 AP)
 * @param {object} req - Petición con target {x, y}
 * @param {object} res - Respuesta Express
 * @param {function} next - Siguiente middleware
 */
export const dropMine = async (req, res, next) => {
    const transaccion = await sequelize.transaction();
    try {
        const { matchId } = req.params;
        const { shipId, target } = req.body;

        const partida = await Match.findByPk(matchId, { transaction: transaccion });
        const barco = await ShipInstance.findByPk(shipId, { transaction: transaccion });
        const jugador = await MatchPlayer.findOne({ where: { matchId, userId: req.user.id }, transaction: transaccion });

        if (jugador.ammoCurrent < 2) {
            await transaccion.rollback();
            return res.status(403).json({ message: 'Munición insuficiente (2 AP)' });
        }

        const dx = Math.abs(target.x - barco.x);
        const dy = Math.abs(target.y - barco.y);

        if (dx > 1 || dy > 1) {
            await transaccion.rollback();
            return res.status(400).json({ message: 'La mina debe colocarse adyacente al barco' });
        }

        await Projectile.create({
            matchId, ownerId: req.user.id, type: 'MINE',
            x: target.x, y: target.y, lifeDistance: 10
        }, { transaction: transaccion });

        jugador.ammoCurrent -= 2;
        barco.lastAttackTurn = partida.turnNumber;

        await jugador.save({ transaction: transaccion });
        await barco.save({ transaction: transaccion });
        await transaccion.commit();

        res.json({ message: 'Mina colocada', ammoCurrent: jugador.ammoCurrent });
    } catch (error) {
        await transaccion.rollback();
        next(error);
    }
};