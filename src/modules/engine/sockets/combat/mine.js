/**
 * Manejador de Socket para la colocación de minas.
 */
import EngineDao from '../../dao/EngineDao.js';
import MatchDao from '../../../game/dao/MatchDao.js';
import ProjectileDao from '../../dao/ProjectileDao.js';
import * as combatService from '../../services/combatService.js';

export const handleMineDrop = async (io, socket, data) => {
    const { matchId, shipId, target } = data;
    const userId = socket.data.user.id;

    try {
        const partida = await MatchDao.findById(matchId);
        const barco = await EngineDao.findById(shipId);
        const jugador = await MatchDao.findMatchPlayer(matchId, userId);

        if (!barco || !jugador || !partida) {
            throw new Error('No se han encontrado las entidades necesarias para colocar la mina');
        }
        const mina = barco.UserShip?.WeaponTemplates?.find(w => w.type === 'MINE');
        if (!mina) {
            throw new Error('El barco no tiene equipadas minas');
        }

        if (jugador.ammoCurrent < mina.apCost) {
            throw new Error('Munición insuficiente para mina');
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
        });

        const nuevaMunicion = jugador.ammoCurrent - mina.apCost;
        await MatchDao.updateResources(jugador.id, jugador.fuelReserve, nuevaMunicion);
        await EngineDao.updateLastAttackTurn(barco.id, partida.turnNumber);

        io.to(matchId).emit('projectile:launched', {
            type: 'MINE',
            attackerId: userId,
            ammoCurrent: nuevaMunicion
        });

        await matchService.notificarVisionSala(io, matchId);
        
    } catch (error) {
        socket.emit('game:error', { message: error.message });
    }
};