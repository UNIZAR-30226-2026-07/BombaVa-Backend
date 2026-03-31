/**
 * DAO de Projectile
 * Gestión en base de datos para entidades dinámicas o estáticas en el mapa (Minas, Torpedos).
 */
import { Projectile } from '../../../shared/models/index.js';

class ProjectileDao {
    /**
     * Registra un nuevo proyectil en la partida.
     * @param {Object} data - Datos del proyectil (tipo, dueño, posición inicial, vectores).
     * @returns {Promise<Projectile>} Proyectil persistido.
     */
    async createProjectile(data) {
        return await Projectile.create(data);
    }

    /**
     * Recupera todos los proyectiles activos vinculados a una sesión de juego.
     * @param {string} matchId - Identificador UUID de la partida.
     * @param {Object} [transaction=null] - Transacción de Sequelize opcional.
     * @returns {Promise<Array<Projectile>>} Listado de torpedos y minas.
     */
    async findAllByMatch(matchId, transaction = null) {
        const options = { where: { matchId } };
        if (transaction) options.transaction = transaction;
        return await Projectile.findAll(options);
    }

    /**
     * Elimina un proyectil del tablero tras su explosión o fin de vida.
     * @param {string} id - Identificador UUID del proyectil.
     * @param {Object} [transaction=null] - Transacción de Sequelize opcional.
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
     * @param {Object} data - Campos a actualizar (x, y, lifeDistance).
     * @param {Object} [transaction=null] - Transacción de Sequelize opcional.
     * @returns {Promise<Array>} Resultado de la actualización.
     */
    async updateProjectile(id, data, transaction = null) {
        const options = { where: { id } };
        if (transaction) options.transaction = transaction;
        return await Projectile.update(data, options);
    }
}

export default new ProjectileDao();