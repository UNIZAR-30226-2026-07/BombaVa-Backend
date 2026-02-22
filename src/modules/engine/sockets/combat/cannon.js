/**
 * Lógica de Socket para el ataque de cañón.
 */
import { GAME_RULES } from '../../../../config/index.js';
import { Match, MatchPlayer, sequelize, ShipInstance } from '../../../../shared/models/index.js';
import { combatService } from '../../index.js';

export const handleCannonAttack = async (io, socket, data) => {
    const { matchId, shipId, target } = data;
    const userId = socket.data.user.id;
    const transaction = await sequelize.transaction();

    try {
        const costes = combatService.obtenerCostesCombate();
        const partida = await Match.findByPk(matchId, { transaction });
        const barco = await ShipInstance.findByPk(shipId, { transaction });
        const jugador = await MatchPlayer.findOne({ where: { matchId, userId }, transaction });

        if (!partida || !barco || !jugador) {
            throw new Error('No se han encontrado las entidades necesarias');
        }

        if (barco.lastAttackTurn === partida.turnNumber || jugador.ammoCurrent < costes.CANNON) {
            throw new Error('Ataque no disponible o munición insuficiente');
        }

        if (!combatService.validarRangoAtaque({ x: barco.x, y: barco.y }, target, GAME_RULES.COMBAT.CANNON_RANGE)) {
            throw new Error('Objetivo fuera de rango');
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
            attackerId: userId, hit: !!objetivo, target, targetHp, ammoCurrent: jugador.ammoCurrent
        });
    } catch (error) {
        if (transaction) await transaction.rollback();
        socket.emit('game:error', { message: error.message });
    }
};