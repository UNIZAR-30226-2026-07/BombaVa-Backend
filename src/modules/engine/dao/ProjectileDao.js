/**
 * DAO de Projectile
 * Manejo en base de datos de entidades en movimiento o estáticas en el mapa (Minas, Torpedos)
 */
import { Projectile } from '../../../shared/models/index.js';

class ProjectileDao {
    /**
     * Crea un nuevo proyectil (Mina o Torpedo) en la partida.
     * @param {Object} data Datos del proyectil a crear
     * @returns {Promise<Object>} El proyectil creado
     */
    async createProjectile(data) {
        return await Projectile.create(data);
    }
}

export default new ProjectileDao();