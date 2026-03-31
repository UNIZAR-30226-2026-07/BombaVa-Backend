/**
 * Manejador para la rotación de barcos
 */
import { Match, MatchPlayer, sequelize } from '../../../shared/models/index.js';
import { matchService } from '../../game/index.js';
import EngineDao from '../dao/EngineDao.js';
import { engineService } from '../index.js';

export const handleRotate = async (io, socket, data) => {
    const { matchId, shipId, degrees } = data;
    const userId = socket.data.user.id;
    const transaction = await sequelize.transaction();

    try {
        const costes = engineService.obtenerCostesMovimiento();
        const partida = await Match.findByPk(matchId, { transaction });
        const barco = await EngineDao.findById(shipId);
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

        const size = Math.max(barco.UserShip.ShipTemplate.width, barco.UserShip.ShipTemplate.height);
        const targetCells = engineService.calcularCeldasOcupadas(barco.x, barco.y, nuevaOrientacion, size);
        
        const allAliveShips = await EngineDao.findAllAliveShipsWithSizes(matchId);
        if (engineService.verificarColision(targetCells, allAliveShips, barco.id)) {
            throw new Error('Colisión detectada al rotar');
        }

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

        const socketsEnSala = await io.in(matchId).fetchSockets();
        for (const s of socketsEnSala) {
            const targetUserId = s.data.user.id;
            const vision = await matchService.generarSnapshotVision(matchId, targetUserId);
            s.emit('match:vision_update', vision);
        }
    } catch (error) {
        if (transaction && !transaction.finished) {
            await transaction.rollback();
        }
        socket.emit('game:error', { message: error.message });
    }
};