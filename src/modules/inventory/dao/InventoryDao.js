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

    /**
     * Obtiene todos los mazos de un usuario
     * @param {string} userId 
     * @returns {Promise<Array>}
     */
    async findUserDecks(userId) {
        return await FleetDeck.findAll({
            where: { user_id: userId }
        });
    }

    /**
     * Crea un nuevo mazo de flota
     * @param {Object} deckData 
     * @returns {Promise<Object>}
     */
    async createDeck(deckData) {
        return await FleetDeck.create(deckData);
    }

    /**
     * Activa un mazo y desactiva el resto para un usuario específico
     * @param {string} deckId 
     * @param {string} userId 
     * @returns {Promise<Object|null>}
     */
    async activateDeck(deckId, userId) {
        const t = await sequelize.transaction();
        try {
            await FleetDeck.update(
                { isActive: false },
                { where: { user_id: userId }, transaction: t }
            );

            const deck = await FleetDeck.findOne({
                where: { id: deckId, user_id: userId },
                transaction: t
            });

            if (!deck) {
                await t.rollback();
                return null;
            }

            deck.isActive = true;
            await deck.save({ transaction: t });

            await t.commit();
            return deck;
        } catch (error) {
            await t.rollback();
            throw error;
        }
    }
}

export default new InventoryDao();