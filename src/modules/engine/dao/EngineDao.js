/**
 * DAO de Engine
 * Proporciona acceso directo a la base de datos para entidades tácticas en combate.
 */
import { ShipInstance, ShipTemplate, UserShip, WeaponTemplate } from '../../../shared/models/index.js';

class EngineDao {
    /**
     * Busca todos los barcos instanciados asociados a un jugador.
     * @param {string} playerId - Identificador UUID del jugador.
     * @returns {Promise<Array>} Listado de instancias de barcos.
     */
    async findByPlayerId(playerId) {
        return await ShipInstance.findAll({ where: { playerId } });
    }

    /**
     * Busca la flota completa de un jugador dentro de una partida específica.
     * @param {string} matchId - Identificador UUID de la partida.
     * @param {string} playerId - Identificador UUID del jugador.
     * @returns {Promise<Array>} Listado de barcos en juego.
     */
    async findByMatchAndPlayer(matchId, playerId) {
        return await ShipInstance.findAll({ where: { matchId, playerId } });
    }

    /**
     * Obtiene una instancia de barco específica por su clave primaria, incluyendo su equipamiento.
     * @param {string} id - Identificador UUID de la instancia del barco.
     * @returns {Promise<Object|null>} Instancia del barco con modelos relacionados.
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
     * Cuenta cuántas unidades permanecen a flote para un jugador.
     * @param {string} matchId - Identificador UUID de la partida.
     * @param {string} playerId - Identificador UUID del jugador.
     * @returns {Promise<number>} Cantidad de barcos no hundidos.
     */
    async countAliveShips(matchId, playerId) {
        return await ShipInstance.count({
            where: { matchId, playerId, isSunk: false }
        });
    }
   
    /**
     * Registra un impacto sobre un barco de manera segura.
     * @param {string} id - Identificador UUID del barco.
     * @param {number} newHp - Nuevo valor de puntos de vida.
     * @param {Array<Object>} hitCellsArray - Estado actualizado de las celdas.
     * @param {boolean} isSunk - Flag de destrucción.
     * @param {Object} [transaction=null] - Transacción de Sequelize.
     * @returns {Promise<Object>} Instancia del barco actualizada.
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
     * @param {Object} [transaction=null] - Transacción de Sequelize.
     * @returns {Promise<Array>} Resultado de la actualización.
     */
    async updateLastAttackTurn(id, turnNumber, transaction = null) {
        const options = { where: { id } };
        if (transaction) options.transaction = transaction;
        
        return await ShipInstance.update(
            { lastAttackTurn: turnNumber },
            options
        );
    }

    /**
     * Realiza una creación masiva de barcos para inicializar una partida.
     * @param {Array<Object>} shipsData - Datos iniciales de la flota.
     * @returns {Promise<Array>} Listado de barcos creados.
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
        return await ShipInstance.destroy({ where: { matchId } });
    }

    /**
     * Localiza una unidad viva en unas coordenadas específicas del tablero.
     * @param {string} matchId - Identificador UUID de la partida.
     * @param {number} x - Coordenada X.
     * @param {number} y - Coordenada Y.
     * @returns {Promise<Object|null>} Instancia encontrada o null.
     */
    async findTargetAtCoordinates(matchId, x, y) {
        return await ShipInstance.findOne({
            where: { matchId, x, y, isSunk: false }
        });
    }

    /**
     * Recupera todas las instancias de barcos de una partida.
     * @param {string} matchId - Identificador UUID de la partida.
     * @returns {Promise<Array>} Listado completo de barcos.
     */
    async findByMatchId(matchId) {
        return await ShipInstance.findAll({ where: { matchId } });
    }

    /**
     * Recupera todos los barcos vivos incluyendo información dimensional.
     * @param {string} matchId - Identificador UUID de la partida.
     * @returns {Promise<Array>} Listado de barcos con dimensiones.
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