/**
 * Match Model
 * Controla el estado global de una sesión de juego
 */
const { DataTypes } = require('sequelize');
const { sequelize } = require('../../../config/db');

const Match = sequelize.define('Match', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    status: {
        type: DataTypes.ENUM('WAITING', 'PLAYING', 'FINISHED'),
        defaultValue: 'WAITING'
    },
    turnNumber: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },
    turnExpiresAt: {
        type: DataTypes.DATE
    },
    mapTerrain: {
        type: DataTypes.JSONB,
        allowNull: false
    },
    startedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'matches',
    underscored: true
});

module.exports = Match;