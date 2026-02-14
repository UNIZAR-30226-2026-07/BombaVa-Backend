/**
 * ShipTemplate Model
 * Define las estadísticas base y dimensiones de cada tipo de barco
 */
const { DataTypes } = require('sequelize');
const { sequelize } = require('../../../config/db');

const ShipTemplate = sequelize.define('ShipTemplate', {
    slug: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    width: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    height: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    baseMaxHp: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    supplyCost: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    baseStats: {
        type: DataTypes.JSONB,
        defaultValue: {}
    }
}, {
    tableName: 'ship_templates',
    underscored: true
});

module.exports = ShipTemplate;