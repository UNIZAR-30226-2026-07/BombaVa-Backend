/**
 * Lógica de Socket para el lanzamiento de torpedos.
 */
import { GAME_RULES } from '../../../../config/gameRules.js';
import { Match, MatchPlayer, Projectile, sequelize, ShipInstance } from '../../../../shared/models/index.js';
import * as combatService from '../../services/combatService.js';

export const handleTorpedoLaunch = async (io, socket, data) => {
    const { matchId, shipId } = data;
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

        if (jugador.ammoCurrent < costes.TORPEDO) {
            throw new Error('Munición insuficiente para torpedo');
        }

        const vector = combatService.calcularVectorProyectil(barco.orientation);

        await Projectile.create({
            matchId, ownerId: userId, type: 'TORPEDO',
            x: barco.x + vector.vx, y: barco.y + vector.vy,
            vectorX: vector.vx, vectorY: vector.vy,
            lifeDistance: GAME_RULES.COMBAT.TORPEDO_LIFE
        }, { transaction });

        jugador.ammoCurrent -= costes.TORPEDO;
        barco.lastAttackTurn = partida.turnNumber;

        await Promise.all([barco.save({ transaction }), jugador.save({ transaction })]);
        await transaction.commit();

        io.to(matchId).emit('projectile:launched', {
            type: 'TORPEDO', attackerId: userId, ammoCurrent: jugador.ammoCurrent
        });
    } catch (error) {
        if (transaction) await transaction.rollback();
        socket.emit('game:error', { message: error.message });
    }
};