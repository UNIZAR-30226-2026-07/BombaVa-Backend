/**
 * Lógica de Socket para el ataque de cañón con seguridad transaccional.
 */
import { Match, MatchPlayer, sequelize } from '../../../../shared/models/index.js';
import { matchService } from '../../../game/index.js';
import EngineDao from '../../dao/EngineDao.js';
import * as combatService from '../../services/combatService.js';

/**
 * Maneja la petición de ataque con cañón.
 */
export const handleCannonAttack = async (io, socket, data) => {
    const { matchId, shipId, target } = data;
    const userId = socket.data.user.id;
    const transaction = await sequelize.transaction();

    try {
        const partida = await Match.findByPk(matchId, { transaction });
        const barco = await EngineDao.findById(shipId);
        const jugador = await MatchPlayer.findOne({ where: { matchId, userId }, transaction });

        if (!partida || !barco || !jugador) {
            throw new Error('No se han encontrado las entidades necesarias');
        }

        if (partida.currentTurnPlayerId !== userId) {
            throw new Error('No es tu turno');
        }
        
        const canion = barco.UserShip?.WeaponTemplates?.find(w => w.type === 'CANNON');
        if (!canion) {
            throw new Error('El barco no tiene equipado un cañón');
        }
        
        if (barco.lastAttackTurn === partida.turnNumber || jugador.ammoCurrent < canion.apCost) {
            throw new Error('Ataque no disponible o munición insuficiente');
        }
        
        if (!combatService.validarRangoAtaque({ x: barco.x, y: barco.y }, target, canion.range)) {
            throw new Error('Objetivo fuera de rango');
        }

        const objetivoInfo = await combatService.encontrarObjetivo(matchId, target.x, target.y);
        
        if (objetivoInfo && objetivoInfo.ship.playerId === userId) {
            throw new Error('Fuego amigo no permitido con ataques dirigidos');
        }

        let targetHp = null;
        if (objetivoInfo) {
            const { ship, hitCell } = objetivoInfo;
            const newHp = Math.max(0, ship.currentHp - canion.damage);
            const isSunk = newHp === 0;
            const updatedHitCells = [...(ship.hitCells || []), hitCell];
            
            await EngineDao.registerHit(ship.id, newHp, updatedHitCells, isSunk, transaction);
            targetHp = newHp;
        }

        jugador.ammoCurrent -= canion.apCost;

        await Promise.all([
            jugador.save({ transaction }),
            EngineDao.updateLastAttackTurn(barco.id, partida.turnNumber, transaction)
        ]);

        await transaction.commit();

        io.to(matchId).emit('ship:attacked', {
            attackerId: userId, 
            hit: !!objetivoInfo, 
            target, 
            targetHp, 
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