/**
 * Controlador de Proyectiles
 * Gestiona el lanzamiento de torpedos y minas delegando en los servicios de combate.
 */
import { Match, MatchPlayer, Projectile, sequelize, ShipInstance } from '../../../shared/models/index.js';
import * as combatService from '../services/combatService.js';

/**
 * Crea un proyectil móvil (Torpedo) en el tablero
 */
export const launchTorpedo = async (req, res, next) => {
    const transaccion = await sequelize.transaction();
    try {
        const { matchId } = req.params;
        const { shipId } = req.body;
        const costes = combatService.obtenerCostesCombate();

        const partida = await Match.findByPk(matchId, { transaction: transaccion });
        const barco = await ShipInstance.findByPk(shipId, { transaction: transaccion });
        const jugador = await MatchPlayer.findOne({ where: { matchId, userId: req.user.id }, transaction: transaccion });

        if (!barco || !partida || !jugador || jugador.ammoCurrent < costes.TORPEDO) {
            await transaccion.rollback();
            return res.status(403).json({ message: 'No permitido o munición insuficiente' });
        }

        const vector = combatService.calcularVectorProyectil(barco.orientation);

        await Projectile.create({
            matchId,
            ownerId: req.user.id,
            type: 'TORPEDO',
            x: barco.x + vector.vx,
            y: barco.y + vector.vy,
            vectorX: vector.vx,
            vectorY: vector.vy,
            lifeDistance: 6
        }, { transaction: transaccion });

        jugador.ammoCurrent -= costes.TORPEDO;
        barco.lastAttackTurn = partida.turnNumber;

        await Promise.all([jugador.save({ transaction: transaccion }), barco.save({ transaction: transaccion })]);
        await transaccion.commit();

        res.json({ message: 'Torpedo lanzado', ammoCurrent: jugador.ammoCurrent });
    } catch (error) {
        if (transaccion) await transaccion.rollback();
        next(error);
    }
};

/**
 * Crea un proyectil estático (Mina) en el tablero
 */
export const dropMine = async (req, res, next) => {
    const transaccion = await sequelize.transaction();
    try {
        const { matchId } = req.params;
        const { shipId, target } = req.body;
        const costes = combatService.obtenerCostesCombate();

        const partida = await Match.findByPk(matchId, { transaction: transaccion });
        const barco = await ShipInstance.findByPk(shipId, { transaction: transaccion });
        const jugador = await MatchPlayer.findOne({ where: { matchId, userId: req.user.id }, transaction: transaccion });

        if (!barco || !jugador || !partida || jugador.ammoCurrent < costes.MINE) {
            await transaccion.rollback();
            return res.status(403).json({ message: 'No permitido o munición insuficiente' });
        }

        if (!combatService.validarAdyacencia({ x: barco.x, y: barco.y }, target)) {
            await transaccion.rollback();
            return res.status(400).json({ message: 'Posición no adyacente' });
        }

        await Projectile.create({
            matchId,
            ownerId: req.user.id,
            type: 'MINE',
            x: target.x,
            y: target.y,
            lifeDistance: 10
        }, { transaction: transaccion });

        jugador.ammoCurrent -= costes.MINE;
        barco.lastAttackTurn = partida.turnNumber;

        await Promise.all([jugador.save({ transaction: transaccion }), barco.save({ transaction: transaccion })]);
        await transaccion.commit();

        res.json({ message: 'Mina colocada', ammoCurrent: jugador.ammoCurrent });
    } catch (error) {
        if (transaccion) await transaccion.rollback();
        next(error);
    }
};