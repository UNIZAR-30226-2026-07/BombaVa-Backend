/**
 * Manejador interno de eventos de movimiento.
 */
import MatchDao from '../../game/dao/MatchDao.js';
import EngineDao from '../dao/EngineDao.js';
import { engineService } from '../index.js';
import { matchService } from '../../game/index.js';

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
            const dirTraducida = matchService.traducirOrientacion(nuevaOrientacion, jugador.side);

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