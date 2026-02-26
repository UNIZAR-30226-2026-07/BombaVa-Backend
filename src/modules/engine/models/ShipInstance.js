import { DataTypes } from 'sequelize';
import { sequelize } from '../../../config/db.js';

const ShipInstance = sequelize.define('ShipInstance', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    matchId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'match_id'
    },
    playerId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'player_id'
    },
    userShipId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'user_ship_id'
    },
    x: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: { min: 0, max: 14 }
    },
    y: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: { min: 0, max: 14 }
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
    },
    lastAttackTurn: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'last_attack_turn'
    }
}, {
    tableName: 'ship_instances',
    underscored: true
});

export default ShipInstance;