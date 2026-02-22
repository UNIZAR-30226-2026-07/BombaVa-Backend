/**
 * Manejador interno de eventos de movimiento.
 */
import * as engineService from '../../../modules/engine/services/engineService.js';
import { MatchPlayer, ShipInstance, sequelize } from '../../models/index.js';

export const registerMovementHandlers = (io, socket) => {
    socket.on('ship:move', async (data) => {
        const { matchId, shipId, direction } = data;
        const userId = socket.data.user.id;
        const transaction = await sequelize.transaction();

        try {
            const costes = engineService.obtenerCostesMovimiento();
            const barco = await ShipInstance.findByPk(shipId, { transaction });
            const jugador = await MatchPlayer.findOne({ where: { matchId, userId }, transaction });

            if (!barco || !jugador || jugador.fuelReserve < costes.TRASLACION) {
                throw new Error('Recursos insuficientes');
            }

            const nuevaPos = engineService.calcularTraslacion({ x: barco.x, y: barco.y }, direction);
            barco.x = nuevaPos.x;
            barco.y = nuevaPos.y;
            jugador.fuelReserve -= costes.TRASLACION;

            await Promise.all([barco.save({ transaction }), jugador.save({ transaction })]);
            await transaction.commit();

            io.to(matchId).emit('ship:moved', { shipId, position: nuevaPos, fuelReserve: jugador.fuelReserve, userId });
        } catch (error) {
            await transaction.rollback();
            socket.emit('game:error', { message: error.message });
        }
    });
};