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

    /**
     * Devuelve todos los proyectiles de una partida
     * @param {UUID} matchId Id de la partida
     * @returns {Promise<Array>} Listado de proyectiles
     */
    async findAllProjectiles(matchId){
        return await Projectile.findAll({
            where: {matchId} 
        });
    }

    /**
     * Elimina un proyectil de la partida
     * @param {UUID} id 
     */
    async removeProjectile(id){
        return await Projectile.destroy({
            where: {id}
        });
    }

    /**
     * Actualiza los datos de un proyectil existente.
     * @param {UUID} id Id del proyectil
     * @param {Object} data Objeto con las propiedades a actualizar
     */
    async updateProjectile(id, data) {
        return await Projectile.update(data, {
            where: { id }
        });
    }
}

export default new ProjectileDao();