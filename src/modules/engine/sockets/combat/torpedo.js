/**
 * Lógica de Socket para el lanzamiento de torpedos.
 */
import EngineDao from '../../dao/EngineDao.js';
import MatchDao from '../../../game/dao/MatchDao.js';
import ProjectileDao from '../../dao/ProjectileDao.js';
import * as combatService from '../../services/combatService.js';
import { matchService } from '../../../game/index.js';
import { engineService } from '../../services/index.js';

export const handleTorpedoLaunch = async (io, socket, data) => {
    const { matchId, shipId } = data;
    const userId = socket.data.user.id;

    try {
        const partida = await MatchDao.findById(matchId);
        const barco = await EngineDao.findById(shipId);
        const jugador = await MatchDao.findMatchPlayer(matchId, userId);

        if (!partida || !barco || !jugador) {
            throw new Error('No se han encontrado las entidades necesarias');
        }

        const torpedo = barco.CombatWeapons?.find(w => w.type === 'TORPEDO');
        if (!torpedo) {
            throw new Error('El barco no tiene equipados torpedos');
        }

        if (jugador.ammoCurrent < torpedo.apCost) {
            throw new Error('Munición insuficiente para torpedo');
        }

        const tamanoBase = await EngineDao.getShipSize(barco.id);
        const tamanoReal = engineService.calculartamanoEfectivo(tamanoBase.width, tamanoBase.height, barco.orientation);
        console.log(barco);
        const frente = combatService.obtenerFrente(barco.x, barco.y, barco.orientation, tamanoReal.effectiveWidth, tamanoReal.effectiveHeight);
        const vector = combatService.calcularVectorProyectil(barco.orientation);

        const proyectil = await ProjectileDao.createProjectile({
            matchId, 
            ownerId: userId, 
            type: 'TORPEDO',
            x: frente.topx + vector.vx, 
            y: frente.topy + vector.vy,
            vectorX: vector.vx, 
            vectorY: vector.vy,
            lifeDistance: torpedo.lifeDistance
        })
        console.log(proyectil);
        const nuevaMunicion = jugador.ammoCurrent - torpedo.apCost;
        await MatchDao.updateResources(jugador.id, jugador.fuelReserve, nuevaMunicion);
        await EngineDao.updateLastAttackTurn(barco.id, partida.turnNumber);

        io.to(matchId).emit('projectile:launched', {
            type: 'TORPEDO', attackerId: userId, ammoCurrent: nuevaMunicion
        });

        await matchService.notificarVisionSala(io, matchId);
        
    } catch (error) {
        socket.emit('game:error', { message: error.message });
    }
};