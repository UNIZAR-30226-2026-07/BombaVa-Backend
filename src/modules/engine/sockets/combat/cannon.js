/**
 * Lógica de Socket para el ataque de cañón.
 */
import EngineDao from '../../dao/EngineDao.js';
import MatchDao from '../../../game/dao/MatchDao.js';
import * as combatService from '../../services/combatService.js';
import { matchService } from '../../../game/index.js';
import { engineService } from '../../services/index.js';

export const handleCannonAttack = async (io, socket, data) => {
    const { matchId, shipId, target } = data;
    const userId = socket.data.user.id;

    try {
        const partida = await MatchDao.findById(matchId);
        const barco = await EngineDao.findById(shipId);
        const jugador = await MatchDao.findMatchPlayer(matchId, userId);
        const targetTraducido =  matchService.traducirPosicionTablero(target, jugador.side);
        if (!partida || !barco || !jugador) {
            throw new Error('No se han encontrado las entidades necesarias');
        }
        const cannon = barco.CombatWeapons?.find(w => w.type === 'CANNON');
        if (!cannon) {
            throw new Error('El barco no tiene equipado un cañón');
        }
        if (barco.lastAttackTurn === partida.turnNumber || jugador.ammoCurrent < cannon.apCost) {
            throw new Error('Ataque no disponible o munición insuficiente');
        }

        //Calcular celdas ocupadas del barco
        const tamanoBase = await EngineDao.getShipSize(barco.id);
        const tamanoEfectivo = engineService.calculartamanoEfectivo(tamanoBase.width, tamanoBase.height, barco.orientation);
        const celdasOrigen = engineService.calcularCeldasOcupadas(barco.x, barco.y, tamanoEfectivo.effectiveWidth, tamanoEfectivo.effectiveHeight);

        if (!combatService.validarRangoAtaque(celdasOrigen, targetTraducido, cannon.range)) {
            throw new Error('Objetivo fuera de rango');
        }

        const allAliveShips = await EngineDao.findAllAliveShipsWithSizes(matchId);
        let objetivo = null;

        for (const shipEnemigo of allAliveShips) {
            const tWidth = shipEnemigo.UserShip.ShipTemplate.width;
            const tHeight = shipEnemigo.UserShip.ShipTemplate.height;
            const tTamano = engineService.calculartamanoEfectivo(tWidth, tHeight, shipEnemigo.orientation);
            const tCeldas = engineService.calcularCeldasOcupadas(shipEnemigo.x, shipEnemigo.y, tTamano.effectiveWidth, tTamano.effectiveHeight);
            
            // Verificamos si la celda objetivo pertenece a este barco
            const impactado = tCeldas.some(celda => celda.x === targetTraducido.x && celda.y === targetTraducido.y);
            
            if (impactado) {
                objetivo = shipEnemigo;
                break;
            }
        }
        let targetHp = null;
        if (objetivo) {
            const newHp = Math.max(0, objetivo.currentHp - cannon.damage);
            const isSunk = newHp === 0;
            
            await EngineDao.registerHit(objetivo.id, newHp, objetivo.hitCells || [], isSunk);
            targetHp = newHp;
        }

        const nuevaMunicion = jugador.ammoCurrent - cannon.apCost;
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