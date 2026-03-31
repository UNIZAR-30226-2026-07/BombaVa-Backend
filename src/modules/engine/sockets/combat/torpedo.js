/**
 * Lógica de Socket para el lanzamiento de torpedos con seguridad transaccional.
 */
import { Match, MatchPlayer, sequelize } from '../../../../shared/models/index.js';
import { matchService } from '../../../game/index.js';
import EngineDao from '../../dao/EngineDao.js';
import ProjectileDao from '../../dao/ProjectileDao.js';
import * as combatService from '../../services/combatService.js';

/**
 * Maneja el lanzamiento de un torpedo.
 */
export const handleTorpedoLaunch = async (io, socket, data) => {
    const { matchId, shipId } = data;
    const userId = socket.data.user.id;
    const transaction = await sequelize.transaction();

    try {
        const partida = await Match.findByPk(matchId, { transaction });
        const barco = await EngineDao.findById(shipId);
        const jugador = await MatchPlayer.findOne({ where: { matchId, userId }, transaction });

        if (!partida || !barco || !jugador) {
            throw new Error('Entidades no encontradas');
        }

        if (partida.currentTurnPlayerId !== userId) {
            throw new Error('No es tu turno');
        }

        const torpedo = barco.UserShip?.WeaponTemplates?.find(w => w.type === 'TORPEDO');
        if (!torpedo) {
            throw new Error('El barco no tiene equipados torpedos');
        }

        if (barco.lastAttackTurn === partida.turnNumber || jugador.ammoCurrent < torpedo.apCost) {
            throw new Error('Ataque no disponible o munición insuficiente');
        }

        const vector = combatService.calcularVectorProyectil(barco.orientation);

        await ProjectileDao.createProjectile({
            matchId, 
            ownerId: userId, 
            type: 'TORPEDO',
            x: barco.x + vector.vx, 
            y: barco.y + vector.vy,
            vectorX: vector.vx, 
            vectorY: vector.vy,
            lifeDistance: torpedo.lifeDistance
        }, transaction);

        jugador.ammoCurrent -= torpedo.apCost;

        await Promise.all([
            jugador.save({ transaction }),
            EngineDao.updateLastAttackTurn(barco.id, partida.turnNumber, transaction)
        ]);

        await transaction.commit();

        io.to(matchId).emit('projectile:launched', {
            type: 'TORPEDO', 
            attackerId: userId, 
            ammoCurrent: jugador.ammoCurrent
        });

        await matchService.notificarVisionSala(io, matchId);
        
    } catch (error) {
        if (transaction && !transaction.finished) {
            await transaction.rollback();
        }
        socket.emit('game:error', { message: error.message });
    }
};