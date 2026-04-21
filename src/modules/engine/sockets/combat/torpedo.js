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
        const frente = combatService.obtenerFrente(barco.x, barco.y, barco.orientation, tamanoReal.effectiveWidth, tamanoReal.effectiveHeight);
        const vector = combatService.calcularVectorProyectil(barco.orientation);

        const spawnX = frente.topx + vector.vx;
        const spawnY = frente.topy + vector.vy;

        if (!engineService.validarLimitesMapa([{ x: spawnX, y: spawnY }])) {
            throw new Error('No puedes disparar un torpedo apuntando hacia fuera del límite del tablero');
        }

        //Validar que no colisione inmediatamente con otro proyectil
        const proyectilesExistentes = await ProjectileDao.findAllProjectiles(matchId);
        if (proyectilesExistentes.some(p => p.x === spawnX && p.y === spawnY)) {
            throw new Error('La trayectoria de lanzamiento está bloqueada por otro proyectil');
        }

        //Validar que no se lance justo donde ya hay un barco
        const barcosVivos = await EngineDao.findAllAliveShipsWithSizes(matchId);
        for (const b of barcosVivos) {
            const tamanoBarcoColision = engineService.calculartamanoEfectivo(
                b.UserShip.ShipTemplate.width, 
                b.UserShip.ShipTemplate.height, 
                b.orientation
            );
            const celdas = engineService.calcularCeldasOcupadas(
                b.x, b.y, 
                tamanoBarcoColision.effectiveWidth, tamanoBarcoColision.effectiveHeight
            );
            if (celdas.some(c => c.x === spawnX && c.y === spawnY)) {
                throw new Error('La trayectoria de lanzamiento está bloqueada por un barco cercano');
            }
        }

        const posTraducida = matchService.traducirPosicionTablero({x: spawnX, y: spawnY}, jugador.side);
        const vectTraducida = matchService.traducirVectorProyectil(vector, jugador.side);

        const proyectil = await ProjectileDao.createProjectile({
            matchId, 
            ownerId: userId, 
            type: 'TORPEDO',
            x: spawnX, 
            y: spawnY,
            vectorX: vector.vx, 
            vectorY: vector.vy,
            lifeDistance: torpedo.lifeDistance,
            damage: torpedo.damage
        })
        const nuevaMunicion = jugador.ammoCurrent - torpedo.apCost;
        await MatchDao.updateResources(jugador.id, jugador.fuelReserve, nuevaMunicion);
        await EngineDao.updateLastAttackTurn(barco.id, partida.turnNumber);

        io.to(matchId).emit('projectile:launched', {
            id: proyectil.id,
            lifeDistance: proyectil.lifeDistance,
            matchId: proyectil.matchId,
            ownerId: proyectil.ownerId,
            type: proyectil.type,
            vectorX: vectTraducida.vx,
            vectorY: vectTraducida.vy,
            x: posTraducida.x,
            y: posTraducida.y, 
            ammoCurrent: nuevaMunicion
        });

        await matchService.notificarVisionSala(io, matchId);
        
    } catch (error) {
        socket.emit('game:error', { message: error.message });
    }
};