/**
 * Manejador centralizado de eventos de juego vía Sockets.
 * Gestiona movimientos, ataques y estados de partida en tiempo real.
 * 
 * @param {Object} io - Instancia global de Socket.io.
 * @param {Object} socket - Socket del cliente autenticado.
 */
import * as combatService from '../../modules/engine/services/combatService.js';
import * as engineService from '../../modules/engine/services/engineService.js';
import { Match, MatchPlayer, ShipInstance, sequelize } from '../models/index.js';

export const registerGameHandlers = (io, socket) => {

    /**
     * Une al jugador a la sala específica de su partida.
     */
    socket.on('game:join', (matchId) => {
        socket.join(matchId);
    });

    /**
     * Gestiona el movimiento de un barco en tiempo real.
     */
    socket.on('ship:move', async (data) => {
        const { matchId, shipId, direction } = data;
        const userId = socket.data.user.id;
        const transaction = await sequelize.transaction();

        try {
            const costes = engineService.obtenerCostesMovimiento();
            const barco = await ShipInstance.findByPk(shipId, { transaction });
            const jugador = await MatchPlayer.findOne({ where: { matchId, userId }, transaction });

            if (!barco || !jugador || jugador.fuelReserve < costes.TRASLACION) {
                throw new Error('Recursos insuficientes o barco no encontrado');
            }

            const nuevaPos = engineService.calcularTraslacion({ x: barco.x, y: barco.y }, direction);

            if (!engineService.validarLimitesMapa(nuevaPos.x, nuevaPos.y)) {
                throw new Error('Movimiento fuera de límites');
            }

            barco.x = nuevaPos.x;
            barco.y = nuevaPos.y;
            jugador.fuelReserve -= costes.TRASLACION;

            await barco.save({ transaction });
            await jugador.save({ transaction });
            await transaction.commit();

            io.to(matchId).emit('ship:moved', {
                shipId,
                position: { x: barco.x, y: barco.y },
                fuelReserve: jugador.fuelReserve,
                userId
            });

        } catch (error) {
            await transaction.rollback();
            socket.emit('game:error', { message: error.message });
        }
    });

    /**
     * Gestiona el ataque de cañón sincronizado.
     */
    socket.on('ship:attack:cannon', async (data) => {
        const { matchId, shipId, target } = data;
        const userId = socket.data.user.id;
        const transaction = await sequelize.transaction();

        try {
            const costes = combatService.obtenerCostesCombate();
            const partida = await Match.findByPk(matchId, { transaction });
            const barco = await ShipInstance.findByPk(shipId, { transaction });
            const jugador = await MatchPlayer.findOne({ where: { matchId, userId }, transaction });

            if (barco.lastAttackTurn === partida.turnNumber || jugador.ammoCurrent < costes.CANNON) {
                throw new Error('Ataque no disponible o munición insuficiente');
            }

            const objetivo = await ShipInstance.findOne({
                where: { matchId, x: target.x, y: target.y, isSunk: false },
                transaction
            });

            let targetHp = null;
            if (objetivo) {
                await combatService.aplicarDañoImpacto(objetivo, 'CANNON', transaction);
                targetHp = objetivo.currentHp;
            }

            jugador.ammoCurrent -= costes.CANNON;
            barco.lastAttackTurn = partida.turnNumber;

            await barco.save({ transaction });
            await jugador.save({ transaction });
            await transaction.commit();

            io.to(matchId).emit('ship:attacked', {
                attackerId: userId,
                hit: !!objetivo,
                target,
                targetHp,
                ammoCurrent: jugador.ammoCurrent
            });

        } catch (error) {
            await transaction.rollback();
            socket.emit('game:error', { message: error.message });
        }
    });
};