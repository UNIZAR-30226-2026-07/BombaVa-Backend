/**
 * ShipInstance Model
 * Representa un barco fisico sobre la matriz en una partida activa
 */
import { DataTypes } from 'sequelize';
import { sequelize } from '../../../config/db.js';

const ShipInstance = sequelize.define('ShipInstance', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    x: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    y: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    orientation: {
        type: DataTypes.ENUM('N', 'S', 'E', 'W'),
        allowNull: false
    },
    currentHp: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    hitCells: {
        type: DataTypes.JSONB,
        defaultValue: []
    },
    isSunk: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    tableName: 'ship_instances',
    underscored: true
});

export default ShipInstance;