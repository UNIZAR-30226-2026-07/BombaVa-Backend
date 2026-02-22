/**
 * Manejador de Socket para la colocación de minas.
 */
import { GAME_RULES } from '../../../../config/gameRules.js';
import { Match, MatchPlayer, Projectile, sequelize, ShipInstance } from '../../../../shared/models/index.js';
import * as combatService from '../../services/combatService.js';

export const handleMineDrop = async (io, socket, data) => {
    const { matchId, shipId, target } = data;
    const userId = socket.data.user.id;
    const transaction = await sequelize.transaction();

    try {
        const costes = combatService.obtenerCostesCombate();
        const partida = await Match.findByPk(matchId, { transaction });
        const barco = await ShipInstance.findByPk(shipId, { transaction });
        const jugador = await MatchPlayer.findOne({ where: { matchId, userId }, transaction });

        if (!barco || !jugador || !partida) {
            throw new Error('No se han encontrado las entidades necesarias para colocar la mina');
        }

        if (jugador.ammoCurrent < costes.MINE) {
            throw new Error('Munición insuficiente para mina');
        }

        if (!combatService.validarAdyacencia({ x: barco.x, y: barco.y }, target)) {
            throw new Error('La posición de la mina está fuera de rango');
        }

        await Projectile.create({
            matchId,
            ownerId: userId,
            type: 'MINE',
            x: target.x,
            y: target.y,
            lifeDistance: GAME_RULES.COMBAT.MINE_LIFE
        }, { transaction });

        jugador.ammoCurrent -= costes.MINE;
        barco.lastAttackTurn = partida.turnNumber;

        await Promise.all([barco.save({ transaction }), jugador.save({ transaction })]);
        await transaction.commit();

        io.to(matchId).emit('projectile:launched', {
            type: 'MINE',
            attackerId: userId,
            ammoCurrent: jugador.ammoCurrent
        });
    } catch (error) {
        if (transaction) await transaction.rollback();
        socket.emit('game:error', { message: error.message });
    }
};