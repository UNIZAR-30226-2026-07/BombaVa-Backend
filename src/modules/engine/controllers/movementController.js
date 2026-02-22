/**
 * Controlador de Movimiento
 * Orquesta las peticiones de traslación y rotación.
 */
import { MatchPlayer, ShipInstance, sequelize } from '../../../shared/models/index.js';
import * as engineService from '../services/engineService.js';

/**
 * Ejecuta el movimiento de un barco validando recursos
 */
export const moveShip = async (req, res, next) => {
    const transaccion = await sequelize.transaction();
    try {
        const { matchId } = req.params;
        const { shipId, direction } = req.body;
        const costes = engineService.obtenerCostesMovimiento();

        const barco = await ShipInstance.findByPk(shipId, { transaction: transaccion });
        const jugador = await MatchPlayer.findOne({ where: { matchId, userId: req.user.id }, transaction: transaccion });

        if (!barco || !jugador || jugador.fuelReserve < costes.TRASLACION) {
            await transaccion.rollback();
            return res.status(403).json({ message: 'Recursos insuficientes o barco no encontrado' });
        }

        const nuevaPos = engineService.calcularTraslacion({ x: barco.x, y: barco.y }, direction);

        if (!engineService.validarLimitesMapa(nuevaPos.x, nuevaPos.y)) {
            await transaccion.rollback();
            return res.status(400).json({ message: 'Movimiento fuera de límites' });
        }

        barco.x = nuevaPos.x;
        barco.y = nuevaPos.y;
        jugador.fuelReserve -= costes.TRASLACION;

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
 * Ejecuta la rotación de un barco
 */
export const rotateShip = async (req, res, next) => {
    const transaccion = await sequelize.transaction();
    try {
        const { matchId } = req.params;
        const { shipId, degrees } = req.body;
        const costes = engineService.obtenerCostesMovimiento();

        const barco = await ShipInstance.findByPk(shipId, { transaction: transaccion });
        const jugador = await MatchPlayer.findOne({ where: { matchId, userId: req.user.id }, transaction: transaccion });

        if (!barco || !jugador || jugador.fuelReserve < costes.ROTACION) {
            await transaccion.rollback();
            return res.status(403).json({ message: 'Combustible insuficiente' });
        }

        barco.orientation = engineService.calcularRotacion(barco.orientation, degrees);
        jugador.fuelReserve -= costes.ROTACION;

        await barco.save({ transaction: transaccion });
        await jugador.save({ transaction: transaccion });
        await transaccion.commit();

        res.json({ fuelReserve: jugador.fuelReserve, orientation: barco.orientation });
    } catch (error) {
        if (transaccion) await transaccion.rollback();
        next(error);
    }
};