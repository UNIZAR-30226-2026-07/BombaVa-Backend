/**
 * Manejador de Socket para la colocación de minas con seguridad transaccional.
 */
import { Match, MatchPlayer, sequelize } from '../../../../shared/models/index.js';
import { matchService } from '../../../game/index.js';
import EngineDao from '../../dao/EngineDao.js';
import ProjectileDao from '../../dao/ProjectileDao.js';
import * as combatService from '../../services/combatService.js';

/**
 * Maneja el despliegue de una mina en el tablero.
 */
export const handleMineDrop = async (io, socket, data) => {
    const { matchId, shipId, target } = data;
    const userId = socket.data.user.id;
    const transaction = await sequelize.transaction();

    try {
        const partida = await Match.findByPk(matchId, { transaction });
        const barco = await EngineDao.findById(shipId);
        const jugador = await MatchPlayer.findOne({ where: { matchId, userId }, transaction });

        if (!barco || !jugador || !partida) {
            throw new Error('Entidades no encontradas');
        }

        if (partida.currentTurnPlayerId !== userId) {
            throw new Error('No es tu turno');
        }

        const mina = barco.UserShip?.WeaponTemplates?.find(w => w.type === 'MINE');
        if (!mina) {
            throw new Error('El barco no tiene equipadas minas');
        }

        if (barco.lastAttackTurn === partida.turnNumber || jugador.ammoCurrent < mina.apCost) {
            throw new Error('Ataque no disponible o munición insuficiente');
        }

        if (!combatService.validarAdyacencia({ x: barco.x, y: barco.y }, target)) {
            throw new Error('La posición de la mina está fuera de rango');
        }

        await ProjectileDao.createProjectile({
            matchId,
            ownerId: userId,
            type: 'MINE',
            x: target.x,
            y: target.y,
            lifeDistance: mina.lifeDistance
        }, transaction);

        jugador.ammoCurrent -= mina.apCost;

        await Promise.all([
            jugador.save({ transaction }),
            EngineDao.updateLastAttackTurn(barco.id, partida.turnNumber, transaction)
        ]);

        await transaction.commit();

        io.to(matchId).emit('projectile:launched', {
            type: 'MINE',
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