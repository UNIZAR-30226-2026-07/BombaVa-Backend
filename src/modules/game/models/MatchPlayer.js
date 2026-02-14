/**
 * MatchPlayer Model
 * Atributos dinamicos del jugador durante la batalla
 */
const { DataTypes } = require('sequelize');
const { sequelize } = require('../../../config/db');

const MatchPlayer = sequelize.define('MatchPlayer', {
    fuelReserve: {
        type: DataTypes.INTEGER,
        defaultValue: 100
    },
    ammoCurrent: {
        type: DataTypes.INTEGER,
        defaultValue: 10
    },
    side: {
        type: DataTypes.ENUM('NORTH', 'SOUTH'),
        allowNull: false
    },
    deckSnapshot: {
        type: DataTypes.JSONB
    }
}, {
    tableName: 'match_players',
    underscored: true
});

module.exports = MatchPlayer;