/**
 * Manejador para la traslación de barcos.
 */
import { Match, MatchPlayer, sequelize } from '../../../shared/models/index.js';
import { matchService } from '../../game/index.js';
import EngineDao from '../dao/EngineDao.js';
import { engineService } from '../index.js';

export const handleMove = async (io, socket, data) => {
    const { matchId, shipId, direction } = data;
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

        if (jugador.fuelReserve < costes.TRASLACION) {
            throw new Error('Recursos insuficientes');
        }

        const absoluteDirection = engineService.traducirDireccionEntrada(direction, jugador.side);
        const nuevaPos = engineService.calcularTraslacion({ x: barco.x, y: barco.y }, absoluteDirection);

        if (!engineService.validarLimitesMapa(nuevaPos.x, nuevaPos.y)) {
            throw new Error('Movimiento fuera de límites');
        }

        const size = Math.max(barco.UserShip.ShipTemplate.width, barco.UserShip.ShipTemplate.height);
        const targetCells = engineService.calcularCeldasOcupadas(nuevaPos.x, nuevaPos.y, barco.orientation, size);
        
        const allAliveShips = await EngineDao.findAllAliveShipsWithSizes(matchId);
        if (engineService.verificarColision(targetCells, allAliveShips, barco.id)) {
            throw new Error('Colisión detectada: Casilla ocupada');
        }

        barco.x = nuevaPos.x;
        barco.y = nuevaPos.y;
        jugador.fuelReserve -= costes.TRASLACION;

        await Promise.all([
            barco.save({ transaction }),
            jugador.save({ transaction })
        ]);

        await transaction.commit();

        io.to(matchId).emit('ship:moved', {
            shipId,
            position: nuevaPos,
            fuelReserve: jugador.fuelReserve,
            userId
        });

        await matchService.notificarVisionSala(io, matchId);

    } catch (error) {
        if (transaction && !transaction.finished) {
            await transaction.rollback();
        }
        socket.emit('game:error', { message: error.message });
    }
};