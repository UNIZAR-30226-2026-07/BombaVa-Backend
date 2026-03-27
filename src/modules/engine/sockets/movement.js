/**
 * Manejador interno de eventos de movimiento.
 */
import { Match, MatchPlayer, ShipInstance, sequelize } from '../../../shared/models/index.js';
import { engineService } from '../index.js';
import { matchService } from '../../game/index.js';

export const registerMovementHandlers = (io, socket) => {

    /**
     * Mueve un barco una casilla.
     */
    socket.on('ship:move', async (data) => {
        const { matchId, shipId, direction } = data;
        const userId = socket.data.user.id;
        const transaction = await sequelize.transaction();

        try {
            const costes = engineService.obtenerCostesMovimiento();
            const partida = await Match.findByPk(matchId, { transaction });
            const barco = await ShipInstance.findByPk(shipId, { transaction });
            const jugador = await MatchPlayer.findOne({ where: { matchId, userId }, transaction });

            if (!barco || !jugador || !partida) {
                throw new Error('Entidades no encontradas');
            }

            if (partida.currentTurnPlayerId !== userId) {
                throw new Error('No es tu turno');
            }

            if (jugador.fuelReserve < costes.TRASLACION) {
                throw new Error('Recursos insuficientes');
            }

            const nuevaPos = engineService.calcularTraslacion({ x: barco.x, y: barco.y }, direction);

            if (!engineService.validarLimitesMapa(nuevaPos.x, nuevaPos.y)) {
                throw new Error('Movimiento fuera de límites');
            }

            barco.x = nuevaPos.x;
            barco.y = nuevaPos.y;
            jugador.fuelReserve -= costes.TRASLACION;

            await Promise.all([
                barco.save({ transaction }),
                jugador.save({ transaction })
            ]);

            await transaction.commit();

            //NOTA: QUIZA ESTOS CAMBIARLOS POR MENSAJES INDIVIDUALES
            io.to(matchId).emit('ship:moved', {
                shipId,
                position: nuevaPos,
                fuelReserve: jugador.fuelReserve,
                userId
            });

            //Actualización de Visión
            //No cambiar aqui para V2, cambiar generarSnapshotVision
            const socketsEnSala = await io.in(matchId).fetchSockets();
            for (const s of socketsEnSala) {
                const targetUserId = s.data.user.id;
                const vision = await matchService.generarSnapshotVision(matchId, targetUserId);
                s.emit('match:vision_update', vision); // Emitimos solo a este socket
            }
        } catch (error) {
            if (transaction) await transaction.rollback();
            socket.emit('game:error', { message: error.message });
        }
    });

    /**
     * Rota un barco 90 o -90 grados.
     */
    socket.on('ship:rotate', async (data) => {
        const { matchId, shipId, degrees } = data;
        const userId = socket.data.user.id;
        const transaction = await sequelize.transaction();

        try {
            const costes = engineService.obtenerCostesMovimiento();
            const partida = await Match.findByPk(matchId, { transaction });
            const barco = await ShipInstance.findByPk(shipId, { transaction });
            const jugador = await MatchPlayer.findOne({ where: { matchId, userId }, transaction });

            if (!barco || !jugador || !partida) {
                throw new Error('Entidades no encontradas');
            }

            if (partida.currentTurnPlayerId !== userId) {
                throw new Error('No es tu turno');
            }

            if (jugador.fuelReserve < costes.ROTACION) {
                throw new Error('Recursos insuficientes para rotar');
            }

            if (degrees !== 90 && degrees !== -90) {
                throw new Error('Rotación inválida. Solo 90 o -90 grados.');
            }

            const nuevaOrientacion = engineService.calcularRotacion(barco.orientation, degrees);

            barco.orientation = nuevaOrientacion;
            jugador.fuelReserve -= costes.ROTACION;

            await Promise.all([
                barco.save({ transaction }),
                jugador.save({ transaction })
            ]);

            await transaction.commit();

            io.to(matchId).emit('ship:rotated', {
                shipId,
                orientation: nuevaOrientacion,
                fuelReserve: jugador.fuelReserve,
                userId
            });

            //Actualización de Visión
            //Misma notas que antes, no cambiar para V2
            const socketsEnSala = await io.in(matchId).fetchSockets();
            for (const s of socketsEnSala) {
                const targetUserId = s.data.user.id;
                const vision = await matchService.generarSnapshotVision(matchId, targetUserId);
                s.emit('match:vision_update', vision); // Emitimos solo a este socket
            }
        } catch (error) {
            if (transaction) await transaction.rollback();
            socket.emit('game:error', { message: error.message });
        }
    });



};