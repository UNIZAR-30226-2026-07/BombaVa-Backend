/**
 * Calcula la niebla de guerra y la traduce para los clientes
 */
import { EngineDao } from '../../engine/dao/index.js';
import { MatchDao } from '../dao/index.js';
import { traducirOrientacion, traducirPosicionTablero } from './boardUtils.js';

export const generarSnapshotVision = async (matchId, userId) => {
    const jugador = await MatchDao.findMatchPlayer(matchId, userId);
    const bando = jugador.side;
    const todosLosBarcos = await EngineDao.findByMatchId(matchId);

    const misBarcosRaw = todosLosBarcos.filter(b => b.playerId === userId);
    const enemigosVisiblesRaw = todosLosBarcos.filter(b => b.playerId !== userId);

    const limpiarYTraducir = (barcos) => barcos.map(barco => {
        const posTraducida = traducirPosicionTablero({ x: barco.x, y: barco.y }, bando);
        const orientacionTraducida = traducirOrientacion(barco.orientation, bando);
        const hitCellsTraducidas = barco.hitCells 
            ? barco.hitCells.map(hit => traducirPosicionTablero(hit, bando))
            :[];

        return {
            id: barco.id,
            x: posTraducida.x,
            y: posTraducida.y,
            orientation: orientacionTraducida,
            currentHp: barco.currentHp,
            hitCells: hitCellsTraducidas,
            isSunk: barco.isSunk
        };
    });

    return {
        myFleet: limpiarYTraducir(misBarcosRaw),
        visibleEnemyFleet: limpiarYTraducir(enemigosVisiblesRaw)
    };
};

export const notificarVisionSala = async (io, matchId) => {
    const socketsEnSala = await io.in(matchId).fetchSockets();
    for (const s of socketsEnSala) {
        const targetUserId = s.data.user.id;
        const vision = await generarSnapshotVision(matchId, targetUserId);
        s.emit('match:vision_update', vision);
    }
};