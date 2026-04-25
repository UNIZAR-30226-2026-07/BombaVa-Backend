/**
 * Manejador de Socket para la colocación de minas.
 */
import EngineDao from '../../dao/EngineDao.js';
import MatchDao from '../../../game/dao/MatchDao.js';
import ProjectileDao from '../../dao/ProjectileDao.js';
import * as combatService from '../../services/combatService.js';
import { matchService } from '../../../game/index.js';
import { engineService } from '../../services/index.js';

export const handleMineDrop = async (io, socket, data) => {
    const { matchId, shipId, target } = data;
    const userId = socket.data.user.id;

    try {
        const partida = await MatchDao.findById(matchId);
        const barco = await EngineDao.findById(shipId);
        const jugador = await MatchDao.findMatchPlayer(matchId, userId);
        const targetTraducido =  matchService.traducirPosicionTablero(target, jugador.side);
        if (!barco || !jugador || !partida) {
            throw new Error('No se han encontrado las entidades necesarias para colocar la mina');
        }
        const mina = barco.CombatWeapons?.find(w => w.type === 'MINE');
        if (!mina) {
            throw new Error('El barco no tiene equipadas minas');
        }

        if (jugador.ammoCurrent < mina.apCost) {
            throw new Error('Munición insuficiente para mina');
        }

        if (partida.status !== 'PLAYING') {
            throw new Error('La partida no está activa');
        }
        
        if (barco.isSunk) {
            throw new Error('El barco está hundido y no puede realizar acciones');
        }

        //Calcular celdas ocupadas del barco
        const tamanoBase = await EngineDao.getShipSize(barco.id);
        const tamanoEfectivo = engineService.calculartamanoEfectivo(tamanoBase.width, tamanoBase.height, barco.orientation);
        const celdasOrigen = engineService.calcularCeldasOcupadas(barco.x, barco.y, tamanoEfectivo.effectiveWidth, tamanoEfectivo.effectiveHeight);

        if (!combatService.validarAdyacencia(celdasOrigen, targetTraducido)) {
            throw new Error('La posición de la mina está fuera de rango (debe estar adyacente)');
        }
        if (!engineService.validarLimitesMapa([targetTraducido])) {
            throw new Error('No puedes colocar una mina fuera del tablero');
        }
        //Validar que no haya ya un proyectil en esa casilla
        const proyectilesExistentes = await ProjectileDao.findAllProjectiles(matchId);
        if (proyectilesExistentes.some(p => p.x === targetTraducido.x && p.y === targetTraducido.y)) {
            throw new Error('Ya hay un proyectil en esa posición');
        }
        //Validar que no se coloque encima de ningun barco barco
        const barcosVivos = await EngineDao.findAllAliveShipsWithSizes(matchId);
        for (const b of barcosVivos) {
            const tamanoReal = engineService.calculartamanoEfectivo(
                b.UserShip.ShipTemplate.width, 
                b.UserShip.ShipTemplate.height, 
                b.orientation
            );
            const celdas = engineService.calcularCeldasOcupadas(
                b.x, b.y, 
                tamanoReal.effectiveWidth, tamanoReal.effectiveHeight
            );
            if (celdas.some(c => c.x === targetTraducido.x && c.y === targetTraducido.y)) {
                throw new Error('No puedes colocar una mina encima de un barco');
            }
        }
        const proyectil = await ProjectileDao.createProjectile({
            matchId,
            ownerId: userId,
            type: 'MINE',
            x: targetTraducido.x,
            y: targetTraducido.y,
            lifeDistance: mina.lifeDistance,
            damage: mina.damage
        });

        const nuevaMunicion = jugador.ammoCurrent - mina.apCost;
        await MatchDao.updateResources(jugador.id, jugador.fuelReserve, nuevaMunicion);
        await EngineDao.updateLastAttackTurn(barco.id, partida.turnNumber);
        const listadoJuagdores = await MatchDao.findPlayersByMatch(matchId);

        for (const jugadorPartida of listadoJuagdores){
            const posTraducida = matchService.traducirPosicionTablero({x: target.x, y: target.x}, jugadorPartida.side);
           
            io.emit('projectile:launched', {
                id: proyectil.id,
                lifeDistance: proyectil.lifeDistance,
                matchId: proyectil.matchId,
                ownerId: proyectil.ownerId,
                type: proyectil.type,
                vectorX: 0,
                vectorY: 0,
                x: posTraducida.x,
                y: posTraducida.y, 
                ammoCurrent: nuevaMunicion
            });
        }
        await matchService.notificarVisionSala(io, matchId);
        
    } catch (error) {
        socket.emit('game:error', { message: error.message });
    }
};