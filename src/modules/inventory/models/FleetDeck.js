/**
 * FleetDeck Model
 * Almacena la configuración del mazo de la flota del usuario
 */
const { DataTypes } = require('sequelize');
const { sequelize } = require('../../../config/db');

const FleetDeck = sequelize.define('FleetDeck', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    deckName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    shipIds: {
        type: DataTypes.JSONB,
        allowNull: false
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    tableName: 'fleet_decks',
    underscored: true
});

module.exports = FleetDeck;