/**
 * DAO de Projectile
 * Gestión en base de datos para entidades dinámicas o estáticas en el mapa.
 */
import { Projectile } from '../../../shared/models/index.js';

class ProjectileDao {
    /**
     * Registra un nuevo proyectil de forma atómica.
     * @param {Object} data - Datos del proyectil.
     * @param {Object} [transaction=null] - Transacción de Sequelize.
     * @returns {Promise<Object>} Proyectil persistido.
     */
    async createProjectile(data, transaction = null) {
        const options = {};
        if (transaction) options.transaction = transaction;
        return await Projectile.create(data, options);
    }

    /**
     * Recupera todos los proyectiles activos.
     * @param {string} matchId - Identificador UUID de la partida.
     * @param {Object} [transaction=null] - Transacción de Sequelize.
     * @returns {Promise<Array>} Listado de proyectiles.
     */
    async findAllByMatch(matchId, transaction = null) {
        const options = { where: { matchId } };
        if (transaction) options.transaction = transaction;
        return await Projectile.findAll(options);
    }

    /**
     * Elimina un proyectil del tablero.
     * @param {string} id - Identificador UUID del proyectil.
     * @param {Object} [transaction=null] - Transacción de Sequelize.
     * @returns {Promise<number>} Resultado de la eliminación.
     */
    async deleteById(id, transaction = null) {
        const options = { where: { id } };
        if (transaction) options.transaction = transaction;
        return await Projectile.destroy(options);
    }

    /**
     * Actualiza la posición o estado de un proyectil existente.
     * @param {string} id - Identificador UUID del proyectil.
     * @param {Object} data - Campos a actualizar.
     * @param {Object} [transaction=null] - Transacción de Sequelize.
     * @returns {Promise<Array>} Resultado de la actualización.
     */
    async updateProjectile(id, data, transaction = null) {
        const options = { where: { id } };
        if (transaction) options.transaction = transaction;
        return await Projectile.update(data, options);
    }
}

export default new ProjectileDao();