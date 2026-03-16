/**
 * DAO de Match
 * Acceso directo a la BBDD para MacthPlayer
 */

import {MatchPlayer} from '../models/index.js';

class MatchPlayerDao {

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
}

export default new MatchPlayerDao();