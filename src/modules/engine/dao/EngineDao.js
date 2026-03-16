

import {ShipInstance} from "../models/index.js";

class EngineDao{

    /**
     * Busca todos los barcos instanciados de un usuario
     * @param {UUID} playerId Id del ususario
     * @returns {Promise<Array>} Listado de barcos
     */
    async findByPlayerId(playerId){
        return await ShipInstance.findAll({
            where: {playerId}
        })
    }
    /**
     * Busca la flota completa de un jugador en una partida específica.
     * @param {UUID} matchId Id de la partida en ejecución
     * @param {UUID} playerId Id del usuario
     * @returns {Promise<Array>} Listado de barcos
     */
    async findByMatchAndPlayer(matchId, playerId) {
        return await ShipInstance.findAll({
            where: { matchId, playerId }
        });
    }

    /**
     * Obtiene un barco específico por su ID.
     * @param {UUID} id Id del barco que se quiere buscar
     * @returns {Promise<Array>} Listado de barcos
     */
    async findById(id) {
        return await ShipInstance.findByPk(id);
    }

    /**
     * Cuenta cuántos barcos le quedan vivos a un jugador en una partida.
     * @param {UUID} matchId Id de la partida en ejecución
     * @param {UUID} playerId Id del usuario
     * @returns {Integer} Numero de barcos restantes vivos para ese jugador
     */
    async countAliveShips(matchId, playerId) {
        return await ShipInstance.count({
            where: { 
                matchId, 
                playerId, 
                isSunk: false 
            }
        });
    }
   
    /**
     * Registra el impacto de un barco dado
     * @param {UUID} id Id del barco dado
     * @param {Integer} newHp La nueva vida del barco
     * @param {Array<Object>} hitCellsArray Listado de cassilas del barco dadas
     * @param {Boolean} isSunk Si el barco se ha hundido
     * @returns La información del barco actualizado
     */
    async registerHit(id, newHp, hitCellsArray, isSunk) {
        const [updatedRows, [updatedShip]] = await ShipInstance.update({
            currentHp: newHp,
            hitCells: hitCellsArray,
            isSunk: isSunk
        }, {
            where: { id },
            returning: true
        });
        return updatedShip;
    }

    /**
     * Actualiza el turno en el que el barco atacó por última vez.
     * @param {UUID} id Id del barco dado
     * @param {Integer} turnNumber Numero del turno actual
     * @return El barco actualizado
     */
    async updateLastAttackTurn(id, turnNumber) {
        return await ShipInstance.update(
            { lastAttackTurn: turnNumber },
            { where: { id } }
        );
    }

    /**
     * Instancia una flota entera al inicio de la partida.
     * @param {Array<Object>} shipsData Array con los datos de los barcos a crear.
     * @return {Array<Object>} Listado de barcos instanciados
     */
    async createFleet(shipsData) {
        return await ShipInstance.bulkCreate(shipsData);
    }

    /**
     * Elimina todos los barcos de una partida.
     * @param {UUID} matchId Id de la partida en ejecución
     * @returns {Integer} Numero de barcos eliminados
     */
    async deleteByMatchId(matchId) {
        return await ShipInstance.destroy({
            where: { matchId }
        });
    }
}

export default new EngineDao();