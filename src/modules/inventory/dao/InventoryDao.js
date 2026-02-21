import ShipTemplate from '../models/ShipTemplate.js';
import UserShip from '../models/UserShip.js';

/**
 * Acceso a datos para el inventario de barcos
 */
class InventoryDao {
    /**
     * Obtiene todos los barcos de un usuario con sus plantillas
     * @param {string} userId 
     * @returns {Promise<Array>} Lista de barcos
     */
    async findUserShips(userId) {
        return await UserShip.findAll({
            where: { user_id: userId },
            include: [{ model: ShipTemplate }]
        });
    }

    /**
     * Obtiene un barco específico de un usuario
     * @param {string} shipId 
     * @param {string} userId 
     * @returns {Promise<Object|null>}
     */
    async findByIdAndUser(shipId, userId) {
        return await UserShip.findOne({
            where: { id: shipId, user_id: userId }
        });
    }

    /**
     * Actualiza las estadísticas y equipamiento de un barco
     * @param {Object} ship 
     * @param {Object} stats 
     * @returns {Promise<Object>}
     */
    async updateShipStats(ship, stats) {
        ship.customStats = { ...ship.customStats, ...stats };
        return await ship.save();
    }
}

export default new InventoryDao();