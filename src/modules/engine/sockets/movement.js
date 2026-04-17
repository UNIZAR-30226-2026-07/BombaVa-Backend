/**
 * Manejador interno de eventos de movimiento.
 */
import MatchDao from '../../game/dao/MatchDao.js';
import EngineDao from '../dao/EngineDao.js';
import { combatService, engineService, Projectile } from '../index.js';
import { matchService } from '../../game/index.js';
import ProjectileDao from '../dao/ProjectileDao.js';

export const registerMovementHandlers = (io, socket) => {

    /**
     * Mueve un barco una casilla.
     */
    socket.on('ship:move', async (data) => {
        const { matchId, shipId, direction } = data;
        const userId = socket.data.user.id;

        try {
            const costes = engineService.obtenerCostesMovimiento();
            const partida = await MatchDao.findById(matchId);
            const barco = await EngineDao.findById(shipId);
            const jugador = await MatchDao.findMatchPlayer(matchId, userId);
            const dirTraducida = matchService.traducirOrientacion(direction, jugador.side);

            if (!barco || !jugador || !partida) {
                throw new Error('Entidades no encontradas');
            }

            if (partida.currentTurnPlayerId !== userId) {
                throw new Error('No es tu turno');
            }

            if (jugador.fuelReserve < costes.TRASLACION) {
                throw new Error('Recursos insuficientes');
            }
            const nuevaPos = engineService.calcularTraslacion({ x: barco.x, y: barco.y }, dirTraducida);

            //Calcular tamaño del barco y las casillas que ocupan
            const tamanoBase = await EngineDao.getShipSize(barco.id);
            const tamanoReal = engineService.calculartamanoEfectivo(tamanoBase.width, tamanoBase.height, barco.orientation);
            const targetCells = engineService.calcularCeldasOcupadas(nuevaPos.x, nuevaPos.y, tamanoReal.effectiveWidth, tamanoReal.effectiveHeight);
            if (!engineService.validarLimitesMapa(targetCells)) {
                throw new Error('Movimiento fuera de límites');
            }

            const allAliveShips = await EngineDao.findAllAliveShipsWithSizes(matchId);
            if (engineService.verificarColision(targetCells, allAliveShips, barco.id)) {
                throw new Error('Colisión detectada: Casilla ocupada');
            }

            //Comprobar colisión con un proyectil
            const allProyectiles = await ProjectileDao.findAllProjectiles(matchId);
            const proyectilColisionado = combatService.colisionBarcoProyectil(targetCells, allProyectiles);
            if (proyectilColisionado != null){
                console.log (barco.currentHp, proyectilColisionado.damage);
                const newHp = Math.max(0, barco.currentHp - proyectilColisionado.damage);
                const isSunk = newHp === 0;
                await EngineDao.registerHit(barco.id, newHp, barco.hitCells || [], isSunk);
                await ProjectileDao.removeProjectile(proyectilColisionado.id);
                io.to(matchId).emit('projectile:hit', {
                    shipId,
                    proyectilColisionado: proyectilColisionado.id,
                    newHp
                });
                console.log( shipId, proyectilColisionado,newHp);
            }
            // Calculamos los nuevos recursos
            const nuevoFuel = jugador.fuelReserve - costes.TRASLACION;

            await EngineDao.updateShipPosition(barco.id, nuevaPos.x, nuevaPos.y);
            await MatchDao.updateResources(jugador.id, nuevoFuel, jugador.ammoCurrent);

            io.to(matchId).emit('ship:moved', {
                shipId,
                position: nuevaPos,
                fuelReserve: nuevoFuel,
                userId
            });

            //Actualización de Visión
            const socketsEnSala = await io.in(matchId).fetchSockets();
            for (const s of socketsEnSala) {
                const targetUserId = s.data.user.id;
                const vision = await matchService.generarSnapshotVision(matchId, targetUserId);
                s.emit('match:vision_update', vision);
            }
        } catch (error) {
            socket.emit('game:error', { message: error.message });
        }
    });

    /**
     * Rota un barco 90 grados.
     */
    socket.on('ship:rotate', async (data) => {
        const { matchId, shipId, degrees } = data;
        const userId = socket.data.user.id;

        try {
            const costes = engineService.obtenerCostesMovimiento();
            const partida = await MatchDao.findById(matchId);
            const barco = await EngineDao.findById(shipId);
            const jugador = await MatchDao.findMatchPlayer(matchId, userId);
            if (!barco || !jugador || !partida) {
                throw new Error('Entidades no encontradas');
            }

            if (partida.currentTurnPlayerId !== userId) {
                throw new Error('No es tu turno');
            }

            if (jugador.fuelReserve < costes.ROTACION) {
                throw new Error('Recursos insuficientes para rotar');
            }

            if (degrees !== 90 && degrees !== -90) {
                throw new Error('Rotación inválida. Solo 90 o -90 grados.');
            }
            
            const nuevaOrientacion = engineService.calcularRotacion(barco.orientation, degrees);

            const tamanoBase = await EngineDao.getShipSize(barco.id);

            const nuevoTamano = engineService.calculartamanoEfectivo( tamanoBase.width, tamanoBase.height, nuevaOrientacion);
            const targetCells = engineService.calcularCeldasOcupadas( barco.x, barco.y, nuevoTamano.effectiveWidth, nuevoTamano.effectiveHeight);

            if (!engineService.validarLimitesMapa(targetCells)) {
                throw new Error('Movimiento inválido: El barco se saldría del mapa al rotar');
            }
            const allAliveShips = await EngineDao.findAllAliveShipsWithSizes(matchId);
            if (engineService.verificarColision(targetCells, allAliveShips, barco.id)) {
                throw new Error('Colisión detectada: No hay espacio suficiente para rotar el barco');
            }

            const dirTraducida = matchService.traducirOrientacion(nuevaOrientacion, jugador.side);

            //Comprobar colisión con un proyectil
            const allProyectiles = await ProjectileDao.findAllProjectiles(matchId);
            const proyectilColisionado = combatService.colisionBarcoProyectil(targetCells, allProyectiles);
            if (proyectilColisionado != null){
                const newHp = Math.max(0, barco.currentHp - proyectilColisionado.damage);
                const isSunk = newHp === 0;
                await EngineDao.registerHit(barco.id, newHp, barco.hitCells || [], isSunk);
                await ProjectileDao.removeProjectile(proyectilColisionado.id);
                io.to(matchId).emit('projectile:hit', {
                    shipId,
                    proyectilColisionado: proyectilColisionado.id,
                    newHp
                });
            }

            // Calculamos los nuevos recursos
            const nuevoFuel = jugador.fuelReserve - costes.ROTACION;

            await EngineDao.updateShipOrientation(barco.id, nuevaOrientacion);
            await MatchDao.updateResources(jugador.id, nuevoFuel, jugador.ammoCurrent);

            io.to(matchId).emit('ship:rotated', {
                shipId,
                orientation: dirTraducida,
                fuelReserve: nuevoFuel,
                userId
            });
            //Actualización de Visión
            const socketsEnSala = await io.in(matchId).fetchSockets();
            for (const s of socketsEnSala) {
                const targetUserId = s.data.user.id;
                const vision = await matchService.generarSnapshotVision(matchId, targetUserId);
                s.emit('match:vision_update', vision);
            }
        } catch (error) {
            socket.emit('game:error', { message: error.message });
        }
    });
};