/**
 * Lógica de Socket para el ataque de cañón.
 */
import EngineDao from '../../dao/EngineDao.js';
import MatchDao from '../../../game/dao/MatchDao.js';
import * as combatService from '../../services/combatService.js';
import { matchService } from '../../../game/index.js';

export const handleCannonAttack = async (io, socket, data) => {
    const { matchId, shipId, target } = data;
    const userId = socket.data.user.id;

    try {
        const partida = await MatchDao.findById(matchId);
        const barco = await EngineDao.findById(shipId);
        const jugador = await MatchDao.findMatchPlayer(matchId, userId);

        if (!partida || !barco || !jugador) {
            throw new Error('No se han encontrado las entidades necesarias');
        }
        const cañon = barco.UserShip?.WeaponTemplates?.find(w => w.type === 'CANNON');
        if (!cañon) {
            throw new Error('El barco no tiene equipado un cañón');
        }
        if (barco.lastAttackTurn === partida.turnNumber || jugador.ammoCurrent < cañon.apCost) {
            throw new Error('Ataque no disponible o munición insuficiente');
        }
        if (!combatService.validarRangoAtaque({ x: barco.x, y: barco.y }, target, cañon.range)) {
            throw new Error('Objetivo fuera de rango');
        }

        const objetivo = await EngineDao.findTargetAtCoordinates(matchId, target.x, target.y);

        let targetHp = null;
        if (objetivo) {
            const newHp = Math.max(0, objetivo.currentHp - cañon.damage);
            const isSunk = newHp === 0;
            
            await EngineDao.registerHit(objetivo.id, newHp, objetivo.hitCells || [], isSunk);
            targetHp = newHp;
        }

        const nuevaMunicion = jugador.ammoCurrent - cañon.apCost;
        await MatchDao.updateResources(jugador.id, jugador.fuelReserve, nuevaMunicion);
        await EngineDao.updateLastAttackTurn(barco.id, partida.turnNumber);

        io.to(matchId).emit('ship:attacked', {
            attackerId: userId, hit: !!objetivo, target, targetHp, ammoCurrent: nuevaMunicion
        });

        await matchService.notificarVisionSala(io, matchId);
        
    } catch (error) {
        socket.emit('game:error', { message: error.message });
    }
};