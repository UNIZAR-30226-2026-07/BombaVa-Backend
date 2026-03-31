/**
 * Engine DAO
 * Direct database access for tactical entities.
 */

import { ShipInstance, ShipTemplate, UserShip, WeaponTemplate } from '../../../shared/models/index.js';

class EngineDao {

    /**
     * Finds all instantiated ships for a user
     * @param {string} playerId User ID
     * @returns {Promise<Array>} List of ships
     */
    async findByPlayerId(playerId) {
        return await ShipInstance.findAll({
            where: { playerId }
        });
    }

    /**
     * Finds the complete fleet of a player in a specific match.
     * @param {string} matchId Match ID
     * @param {string} playerId User ID
     * @returns {Promise<Array>} List of ships
     */
    async findByMatchAndPlayer(matchId, playerId) {
        return await ShipInstance.findAll({
            where: { matchId, playerId }
        });
    }

    /**
     * Retrieves a specific ship by ID with its weapons
     * @param {string} id Ship ID
     * @returns {Promise<Object>} Ship instance
     */
    async findById(id) {
        return await ShipInstance.findByPk(id, {
            include: [{
                model: UserShip,
                include: [{
                    model: WeaponTemplate,
                    as: 'WeaponTemplates'
                }, {
                    model: ShipTemplate
                }]
            }]
        });
    }

    /**
     * Counts how many alive ships a player has left.
     * @param {string} matchId Match ID
     * @param {string} playerId User ID
     * @returns {Promise<number>} Number of alive ships
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
     * Registers a hit on a given ship
     * @param {string} id Ship ID
     * @param {number} newHp New health points
     * @param {Array<Object>} hitCellsArray List of hit cells
     * @param {boolean} isSunk Whether the ship is sunk
     * @param {Object} transaction Sequelize transaction
     * @returns {Promise<Object>} Updated ship
     */
    async registerHit(id, newHp, hitCellsArray, isSunk, transaction = null) {
        const options = { where: { id }, returning: true };
        if (transaction) options.transaction = transaction;

        const [updatedRows, [updatedShip]] = await ShipInstance.update({
            currentHp: newHp,
            hitCells: hitCellsArray,
            isSunk: isSunk
        }, options);
        return updatedShip;
    }

    /**
     * Updates the turn number of the last attack for a ship.
     * @param {string} id Ship ID
     * @param {number} turnNumber Current turn number
     * @returns {Promise<Object>} Updated ship
     */
    async updateLastAttackTurn(id, turnNumber) {
        return await ShipInstance.update(
            { lastAttackTurn: turnNumber },
            { where: { id } }
        );
    }

    /**
     * Instantiates an entire fleet at the start of the match.
     * @param {Array<Object>} shipsData Array with ship data
     * @returns {Promise<Array<Object>>} List of instantiated ships
     */
    async createFleet(shipsData) {
        return await ShipInstance.bulkCreate(shipsData);
    }

    /**
     * Deletes all ships from a match.
     * @param {string} matchId Match ID
     * @returns {Promise<number>} Number of deleted ships
     */
    async deleteByMatchId(matchId) {
        return await ShipInstance.destroy({
            where: { matchId }
        });
    }

    /**
     * Finds an alive ship at specific match coordinates.
     * @param {string} matchId Match ID
     * @param {number} x X coordinate
     * @param {number} y Y coordinate
     * @returns {Promise<Object|null>} Ship instance or null
     */
    async findTargetAtCoordinates(matchId, x, y) {
        return await ShipInstance.findOne({
            where: { matchId, x, y, isSunk: false }
        });
    }

    /**
     * Finds all ships in a match.
     * @param {string} matchId Match ID
     * @returns {Promise<Array>} List of all ships
     */
    async findByMatchId(matchId) {
        return await ShipInstance.findAll({
            where: { matchId }
        });
    }

    /**
     * Finds all alive ships in a match, including their templates to determine size.
     * @param {string} matchId Match ID
     * @returns {Promise<Array>} List of alive ships with template data
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
}

export default new EngineDao();