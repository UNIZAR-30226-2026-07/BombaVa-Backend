/**
 * DAO de Match
 * Acceso directo a la BBDD para los matches
 */
import {Match, MatchPlayer} from '../models/index.js';

class MatchDao {

    /**
     * Crea una nueva partida en estado 'PLAYING'.
     * @param {UUID} userId Id del ususario quien empieza como primero
     * @returns {Promise<Object>} La partida creada.
     */
    async createMatch(userId) {
        return await Match.create({
            status: 'PLAYING',
            mapTerrain: { size: 15, obstacles: [] },
            turnNumber: 1,
            currentTurnPlayerId: userId
        });
    }

    /**
     * Busca una partida por su ID.
     * @param {UUID} id Id de la partida.
     */
    async findById(id) {
        return await Match.findByPk(id, { include: [MatchPlayer] });
    }

    /**
     * Actualiza el estado de la partida.
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

    /**
     * Obtiene un listado de todas las partidas de un usuario
     * @param {UUID} userId Id del usuario
     * @return {Promise<Array>} Listado de todos las partidas de un usuario, con las mas nuevas primero
     */
    async searchAllMatchesFromUser(userId){
        return await Match.findAll({
            include: [{ model: MatchPlayer, where: { userId } }],
            order: [['created_at', 'DESC']]
        })
    }

    /**
     * Añade un jugador a una partida.
     * @param {UUID} matchId Id de la partida.
     * @param {UUID} userId Id del usuario.
     * @param {String} side Lado del tablero.
     * @param {Object} deckSnapshot Foto del mazo con el que entró a jugar.
     */
    async createPlayer(matchId, userId, side, deckSnapshot = null) {
        return await MatchPlayer.create({
            matchId,
            userId,
            side,
            deckSnapshot
        });
    }
    /**
     * Obtiene todos los jugadores de una partida específica (deberían ser 2).
     * @param {UUID} matchId Id de la partida.
     */
    async findPlayersByMatch(matchId) {
        return await MatchPlayer.findAll({
            where: { matchId }
        });
    }

    /**
     * Obtiene la información de un jugador concreto en una partida.
     * @param {UUID} matchId Id de la partida.
     * @param {UUID} userId Id del usuario.
     */
    async findMatchPlayer(matchId, userId) {
        return await MatchPlayer.findOne({
            where: { matchId, userId }
        });
    }

    /**
     * Actualiza los recursos de un jugador.
     * Se usa al inicio del turno (para recargar) o después de moverse/atacar (para gastar).
     * @param {UUID} id Id del registro MatchPlayer (NO el userId).
     * @param {Integer} fuel Nueva cantidad de combustible.
     * @param {Integer} ammo Nueva cantidad de munición.
     */
    async updateResources(id, fuel, ammo) {
        const [updatedRows, [updatedPlayer]] = await MatchPlayer.update({
            fuelReserve: fuel,
            ammoCurrent: ammo
        }, {
            where: { id },
            returning: true
        });
        return updatedPlayer;
    }

    /**
     * Avanza el turno de la partida, cambiando el jugador activo.
     * @param {UUID} id Id de la partida.
     * @param {UUID} currentTurnPlayerId Id del jugador al que le toca ahora.
     * @param {Integer} turnNumber Nuevo número de turno.
     * @returns {Promise<Object>} La partida actualizada.
     */
    async updateTurn(id, currentTurnPlayerId, turnNumber) {
        const [updatedRows, [updatedMatch]] = await Match.update(
            { 
                currentTurnPlayerId: currentTurnPlayerId,
                turnNumber: turnNumber 
            },
            { 
                where: { id },
                returning: true 
            }
        );
        return updatedMatch;
    }
}

export default new MatchDao();