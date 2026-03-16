/**
 * DAO de Match
 * Acceso directo a la BBDD para los matches
 */
import {Match} from '../models/index.js';

class MatchDao {

    /**
     * Crea una nueva partida en estado 'WAITING'.
     * @returns {Promise<Object>} La partida creada.
     */
    async createMatch() {
        return await Match.create({
            status: 'WAITING',
            mapTerrain: { size: 15, obstacles: [] },
            turnNumber: 1
        });
    }

    /**
     * Busca una partida por su ID.
     * @param {UUID} id Id de la partida.
     */
    async findById(id) {
        return await Match.findByPk(id);
    }

    /**
     * Busca partidas que estén esperando un segundo jugador.
     * Muy útil para tu sistema de Matchmaking.
     */
    async findWaitingMatches() {
        return await Match.findAll({
            where: { status: 'WAITING' },
            order: [['created_at', 'ASC']] // Las más antiguas primero
        });
    }

    /**
     * Actualiza el estado de la partida (WAITING -> PLAYING -> FINISHED).
     * @param {UUID} id Id de la partida.
     * @param {String} status Nuevo estado.
     */
    async updateStatus(id, status) {
        const [updatedRows, [updatedMatch]] = await Match.update(
            { status },
            { 
                where: { id },
                returning: true 
            }
        );
        return updatedMatch;
    }

    /**
     * Avanza el turno de la partida.
     * @param {UUID} id Id de la partida.
     * @param {UUID} nextPlayerId ID del jugador al que le toca ahora.
     * @param {Integer} newTurnNumber El número del nuevo turno.
     */
    async advanceTurn(id, nextPlayerId, newTurnNumber) {
        const [updatedRows, [updatedMatch]] = await Match.update({
            currentTurnPlayerId: nextPlayerId,
            turnNumber: newTurnNumber,
        }, {
            where: { id },
            returning: true
        });
        return updatedMatch;
    }
}

export default new MatchDao();