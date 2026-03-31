/**
 * Projectile DAO
 * Database management for moving or static entities (Mines, Torpedoes).
 */
import { Projectile } from '../../../shared/models/index.js';

class ProjectileDao {
    /**
     * Creates a new projectile (Mine or Torpedo).
     * @param {Object} data Projectile data
     * @returns {Promise<Object>} Created projectile
     */
    async createProjectile(data) {
        return await Projectile.create(data);
    }

    /**
     * Finds all active projectiles for a given match.
     * @param {string} matchId Match ID
     * @param {Object} transaction Sequelize transaction
     * @returns {Promise<Array>} List of projectiles
     */
    async findAllByMatch(matchId, transaction = null) {
        const options = { where: { matchId } };
        if (transaction) options.transaction = transaction;
        return await Projectile.findAll(options);
    }

    /**
     * Deletes a projectile by its ID.
     * @param {string} id Projectile ID
     * @param {Object} transaction Sequelize transaction
     * @returns {Promise<number>} Number of deleted rows
     */
    async deleteById(id, transaction = null) {
        const options = { where: { id } };
        if (transaction) options.transaction = transaction;
        return await Projectile.destroy(options);
    }

    /**
     * Updates a projectile's position and life distance.
     * @param {string} id Projectile ID
     * @param {Object} data Data to update
     * @param {Object} transaction Sequelize transaction
     */
    async updateProjectile(id, data, transaction = null) {
        const options = { where: { id } };
        if (transaction) options.transaction = transaction;
        return await Projectile.update(data, options);
    }
}

export default new ProjectileDao();