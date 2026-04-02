/**
 * DAO de Engine
 * Acceso 
 */

import { ShipInstance, UserShip, WeaponTemplate, ShipTemplate } from '../../../shared/models/index.js';

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
     * Obtiene un barco específico por su ID
     * @param {UUID} id Id del barco que se quiere buscar
     * @param {Object} options Opciones extra de Sequelize (ej. { transaction })
     * @returns {Promise<Object>} Instancia del barco con su UserShip y WeaponTemplates
     */
    async findById(id) {
        return await ShipInstance.findByPk(id, {
            include: [{
                model: UserShip,
                include: [{
                    model: WeaponTemplate,
                    as: 'WeaponTemplates'
                }]
            }]
        });
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

    /**
     * Busca un barco vivo en unas coordenadas específicas de la partida.
     * @param {UUID} matchId Id de la partida
     * @param {Integer} x Coordenada X objetivo
     * @param {Integer} y Coordenada Y objetivo
     * @returns {Promise<Object|null>} Instancia del barco objetivo o null si no hay ninguno
     */
    async findTargetAtCoordinates(matchId, x, y) {
        return await ShipInstance.findOne({
            where: { matchId, x, y, isSunk: false }
        });
    }

    /**
     * Busca todos los barcos de una partida (de ambos jugadores).
     * @param {UUID} matchId Id de la partida
     * @returns {Promise<Array>} Listado de todos los barcos
     */
    async findByMatchId(matchId) {
        return await ShipInstance.findAll({
            where: { matchId }
        });
    }

    /**
     * Actualiza la posición (X, Y) de un barco en el tablero.
     * @param {UUID} id Id del barco
     * @param {Integer} x Nueva coordenada X
     * @param {Integer} y Nueva coordenada Y
     * @returns {Promise<Object>} El barco actualizado
     */
    async updateShipPosition(id, x, y) {
        const [updatedRows, [updatedShip]] = await ShipInstance.update(
            { x, y },
            { 
                where: { id },
                returning: true 
            }
        );
        return updatedShip;
    }

    /**
     * Actualiza la orientación de un barco en el tablero.
     * @param {UUID} id Id del barco
     * @param {String} orientation Nueva orientación ('N', 'S', 'E', 'W')
     * @returns {Promise<Object>} El barco actualizado
     */
    async updateShipOrientation(id, orientation) {
        const [updatedRows, [updatedShip]] = await ShipInstance.update(
            { orientation },
            { 
                where: { id },
                returning: true 
            }
        );
        return updatedShip;
    }

    /**
     * Recupera todos los barcos vivos incluyendo información de su plantilla para cálculos de colisión.
     * @param {string} matchId - Identificador UUID de la partida.
     * @returns {Promise<Array<ShipInstance>>} Listado de barcos con dimensiones.
     */
    async findAllAliveShipsWithSizes(matchId) {
        return await ShipInstance.findAll({
            where: { matchId, isSunk: false },
            include: [{
                model: UserShip,
                include: [{ model: ShipTemplate }]
            }]
        });
    }

    /**
     * Obtiene las dimensiones (ancho y alto) de un barco a partir de su instancia.
     * @param {UUID} id - ID de la instancia del barco (ShipInstance).
     * @returns {Promise<{width: number, height: number}|null>} Dimensiones o null si no existe.
     */
    async getShipSize(id) {
        const ship = await ShipInstance.findByPk(id, {
            attributes: ['id'],
            include: [{
                model: UserShip,
                attributes: ['id'],
                include: [{
                    model: ShipTemplate,
                    attributes: ['width', 'height']
                }]
            }]
        });

        if (!ship || !ship.UserShip || !ship.UserShip.ShipTemplate) {
            return null;
        }

        return {
            width: ship.UserShip.ShipTemplate.width,
            height: ship.UserShip.ShipTemplate.height
        };
    }

}

export default new EngineDao();