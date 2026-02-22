/**
 * Manejador interno de eventos de combate.
 */
import * as combatService from '../../../modules/engine/services/combatService.js';
import { Match, MatchPlayer, sequelize, ShipInstance } from '../../models/index.js';

export const registerCombatHandlers = (io, socket) => {
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

            await Promise.all([barco.save({ transaction }), jugador.save({ transaction })]);
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