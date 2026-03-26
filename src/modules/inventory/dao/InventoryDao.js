/**
 * DAO de Inventario
 * Acceso directo a base de datos para barcos, mazos y plantillas.
 */

import { sequelize } from '../../../config/db.js';
import FleetDeck from '../models/FleetDeck.js';
import ShipTemplate from '../models/ShipTemplate.js';
import UserShip from '../models/UserShip.js';
import WeaponTemplate from '../models/WeaponTemplate.js';

class InventoryDao {
    /**
     * Busca todos los barcos asociados a un usuario incluyendo su plantilla base
     * @param {string} userId - UUID del usuario
     * @returns {Promise<Array>} Lista de barcos
     */
    async findUserShips(userId) {
        return await UserShip.findAll({
            where: { userId },
            include: [{ model: ShipTemplate }, { model: WeaponTemplate }]
            
        });
    }

    /**
     * Busca un barco específico validando la propiedad del usuario
     * @param {string} shipId - UUID del barco
     * @param {string} userId - UUID del usuario
     * @returns {Promise<Object|null>}
     */
    async findByIdAndUser(shipId, userId) {
        return await UserShip.findOne({
            where: { id: shipId, userId }
        });
    }

    /**
     * Crea un barco con un usario
     * @param {string} userId - UUID del Usuario
     * @param {string} shipType - Tipo del barco a crear
     * @returns {Promise<Object>} Barco creado
     */
    async associateShip(userId, shipType){
        return await UserShip.create({
            userId: userId,
            templateSlug: shipType
        })
    }

    /**
     * Actualiza las estadísticas personalizadas de un barco
     * @param {Object} ship - Instancia del modelo UserShip
     * @param {Object} stats - Nuevas estadísticas a mezclar
     * @returns {Promise<Object>} Barco actualizado
     */
    async updateShipStats(ship, stats) {
        ship.customStats = { ...ship.customStats, ...stats };
        return await ship.save();
    }

    /**
     * Obtiene todos los mazos configurados por un usuario
     * @param {string} userId - UUID del usuario
     * @returns {Promise<Array>} Lista de mazos
     */
    async findUserDecks(userId) {
        return await FleetDeck.findAll({
            where: { userId }
        });
    }

    /**
     * Obtiene el mazo configurados por un usuario activo
     * @param {string} userId - UUID del usuario
     * @returns {Promise<Object>} Mazo del usuario activo
     */
    async findUserActiveDecks(userId) {
        return await FleetDeck.findOne({
            where: { userId: userId, isActive: true }
        });
    }

    /**
     * Crea un nuevo mazo en la base de datos
     * @param {Object} deckData - Datos del mazo
     * @returns {Promise<Object>} Mazo creado
     */
    async createDeck(deckData) {
        return await FleetDeck.create(deckData);
    }

    /**
     * Activa un mazo específico y desactiva cualquier otro mazo del usuario
     * @param {string} deckId - UUID del mazo a activar
     * @param {string} userId - UUID del usuario propietario
     * @returns {Promise<Object|null>} El mazo activado o null si no existe
     */
    async activateDeck(deckId, userId) {
        const transaccion = await sequelize.transaction();
        try {
            const mazoAActivar = await FleetDeck.findOne({
                where: { id: deckId, userId: userId },
                transaction: transaccion
            });

            if (!mazoAActivar) {
                await transaccion.rollback();
                return null;
            }

            await FleetDeck.update(
                { isActive: false },
                {
                    where: { userId: userId },
                    transaction: transaccion
                }
            );

            mazoAActivar.isActive = true;
            await mazoAActivar.save({ transaction: transaccion });

            await transaccion.commit();
            return mazoAActivar;
        } catch (error) {
            if (transaccion) await transaccion.rollback();
            throw error;
        }
    }

    /**
     * Busca barcos de un usuario incluyendo sus armas equipadas
     */
    async findUserShipsWithWeapons(userId) {
        return await UserShip.findAll({
            where: { userId },
            include: [
                { model: ShipTemplate },
                { model: WeaponTemplate } // Sequelize lo llamará WeaponTemplates por defecto
            ]
        });
    }

    /**
     * Añade un arma al arsenal de un barco
     * @param {Object} shipInstance - Instancia de UserShip
     * @param {string} weaponSlug - Slug del arma
     */
    async addWeaponToShip(shipInstance, weaponSlug) {
        // El método .addWeaponTemplate es creado por Sequelize 
        // debido a la relación belongsToMany definida en shared/models/index.js
        return await shipInstance.addWeaponTemplate(weaponSlug);
    }

    /**
     * Elimina un arma del arsenal de un barco
     */
    async removeWeaponFromShip(shipInstance, weaponSlug) {
        return await shipInstance.removeWeaponTemplate(weaponSlug);
    }

    /**
     * Busca un barco específico con sus armas
     */
    async findByIdWithWeapons(shipId, userId) {
        return await UserShip.findOne({
            where: { id: shipId, userId },
            include: [WeaponTemplate]
        });
    }

    /**
     * Obtiene la vida (HP) de un barco de usuario específico.
     * @param {string} userShipId - El UUID del UserShip.
     * @returns {Promise<Integer>} Un entero con el valor de la vida total.
     */
    async getUserShipHp(userShipId){
        const userShip = await UserShip.findByPk(userShipId, {
            include: [{
                model: ShipTemplate,
                attributes: ['baseMaxHp']
            }]
        });
        return userShip.ShipTemplate.baseMaxHp;
    }
}

export default new InventoryDao();