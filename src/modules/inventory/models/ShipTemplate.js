/**
 * ShipTemplate Model
 * Definición robusta con validaciones explícitas.
 */
import { DataTypes } from 'sequelize';
import { sequelize } from '../../../config/db.js';

const ShipTemplate = sequelize.define('ShipTemplate', {
    slug: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    width: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: {
            min: 1
        }
    },
    height: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: {
            min: 1
        }
    },
    baseMaxHp: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1
        }
    },
    supplyCost: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 0
        }
    },
    baseStats: {
        type: DataTypes.JSONB,
        defaultValue: {}
    }
}, {
    tableName: 'ship_templates',
    underscored: true
});

export default ShipTemplate;