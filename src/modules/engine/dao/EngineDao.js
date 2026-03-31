/**
 * DAO de Engine
 * Proporciona acceso directo a la base de datos para entidades tácticas en combate.
 */

import { ShipInstance, ShipTemplate, UserShip, WeaponTemplate } from '../../../shared/models/index.js';

class EngineDao {

    /**
     * Busca todos los barcos instanciados asociados a un jugador.
     * @param {string} playerId - Identificador UUID del jugador.
     * @returns {Promise<Array<ShipInstance>>} Listado de instancias de barcos.
     */
    async findByPlayerId(playerId) {
        return await ShipInstance.findAll({
            where: { playerId }
        });
    }

    /**
     * Busca la flota completa de un jugador dentro de una partida específica.
     * @param {string} matchId - Identificador UUID de la partida.
     * @param {string} playerId - Identificador UUID del jugador.
     * @returns {Promise<Array<ShipInstance>>} Listado de barcos en juego.
     */
    async findByMatchAndPlayer(matchId, playerId) {
        return await ShipInstance.findAll({
            where: { matchId, playerId }
        });
    }

    /**
     * Obtiene una instancia de barco específica por su clave primaria, incluyendo su equipamiento.
     * @param {string} id - Identificador UUID de la instancia del barco.
     * @returns {Promise<ShipInstance|null>} Instancia del barco con modelos relacionados o null.
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
     * Cuenta cuántas unidades permanecen a flote para un jugador en una partida.
     * @param {string} matchId - Identificador UUID de la partida.
     * @param {string} playerId - Identificador UUID del jugador.
     * @returns {Promise<number>} Cantidad de barcos con isSunk en false.
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
     * Registra un impacto sobre un barco y actualiza su estado de integridad.
     * @param {string} id - Identificador UUID del barco.
     * @param {number} newHp - Nuevo valor de puntos de vida.
     * @param {Array<Object>} hitCellsArray - Estado actualizado de las celdas del barco.
     * @param {boolean} isSunk - Flag que indica si el barco ha sido destruido.
     * @param {Object} [transaction=null] - Transacción de Sequelize opcional para asegurar atomicidad.
     * @returns {Promise<ShipInstance>} Instancia del barco actualizada.
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
     * Actualiza el registro del turno en el que el barco realizó su último ataque.
     * @param {string} id - Identificador UUID del barco.
     * @param {number} turnNumber - Número del turno actual.
     * @returns {Promise<Array>} Resultado de la actualización.
     */
    async updateLastAttackTurn(id, turnNumber) {
        return await ShipInstance.update(
            { lastAttackTurn: turnNumber },
            { where: { id } }
        );
    }

    /**
     * Realiza una creación masiva de barcos para inicializar una partida.
     * @param {Array<Object>} shipsData - Array de objetos con los datos iniciales de la flota.
     * @returns {Promise<Array<ShipInstance>>} Listado de barcos creados.
     */
    async createFleet(shipsData) {
        return await ShipInstance.bulkCreate(shipsData);
    }

    /**
     * Elimina todas las instancias de barcos vinculadas a una partida.
     * @param {string} matchId - Identificador UUID de la partida.
     * @returns {Promise<number>} Cantidad de registros eliminados.
     */
    async deleteByMatchId(matchId) {
        return await ShipInstance.destroy({
            where: { matchId }
        });
    }

    /**
     * Localiza una unidad viva en unas coordenadas específicas del tablero.
     * @param {string} matchId - Identificador UUID de la partida.
     * @param {number} x - Coordenada X.
     * @param {number} y - Coordenada Y.
     * @returns {Promise<ShipInstance|null>} Instancia encontrada o null si es agua o está hundido.
     */
    async findTargetAtCoordinates(matchId, x, y) {
        return await ShipInstance.findOne({
            where: { matchId, x, y, isSunk: false }
        });
    }

    /**
     * Recupera todas las instancias de barcos de una partida, independientemente del jugador.
     * @param {string} matchId - Identificador UUID de la partida.
     * @returns {Promise<Array<ShipInstance>>} Listado completo de barcos en el mapa.
     */
    async findByMatchId(matchId) {
        return await ShipInstance.findAll({
            where: { matchId }
        });
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
}

export default new EngineDao();