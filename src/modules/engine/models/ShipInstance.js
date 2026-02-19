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
        allowNull: false,
        validate: { min: 0, max: 14 } // OJO: Tablero 15x15
    },
    y: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: { min: 0, max: 14 } // OJO: Tablero 15x15
    },
    orientation: {
        type: DataTypes.ENUM('N', 'S', 'E', 'W'),
        allowNull: false,
        validate: {
            isIn: {
                args: [['N', 'S', 'E', 'W']],
                msg: "La orientación debe ser N, S, E o W"
            }
        }
    },
    currentHp: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: { min: 0 }
    },
    hitCells: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: []
    },
    isSunk: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
}, {
    tableName: 'ship_instances',
    underscored: true
});

export default ShipInstance;