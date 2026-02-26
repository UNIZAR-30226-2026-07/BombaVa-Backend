import { FleetDeck, Match, MatchPlayer } from '../../../shared/models/index.js';
import * as matchService from '../services/matchService.js';

/**
 * Orquestador de la persistencia inicial de una partida
 * @param {Array} usuarios - {id, socketId}
 * @returns {Promise<Object>} Partida creada
 */
export const initializeMatchPersistence = async (usuarios) => {
    const nuevaPartida = await Match.create({
        status: 'PLAYING',
        mapTerrain: { size: 15, obstacles: [] },
        turnNumber: 1
    });

    for (let i = 0; i < usuarios.length; i++) {
        const user = usuarios[i];
        const mazo = await FleetDeck.findOne({ where: { userId: user.id, isActive: true } });
        const bando = (i === 0) ? 'NORTH' : 'SOUTH';

        await MatchPlayer.create({
            matchId: nuevaPartida.id,
            userId: user.id,
            side: bando,
            fuelReserve: 10,
            ammoCurrent: 5,
            deckSnapshot: mazo ? mazo.shipIds : []
        });

        if (mazo && mazo.shipIds) {
            await matchService.instanciarFlotaEnPartida(nuevaPartida.id, user.id, bando, mazo.shipIds);
        }
    }

    return nuevaPartida;
};