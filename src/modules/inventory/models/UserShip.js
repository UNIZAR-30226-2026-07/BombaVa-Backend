/**
 * UserShip Model
 * Representa un barco concreto en la colección de un usuario
 */
import { DataTypes } from 'sequelize';
import { sequelize } from '../../../config/db.js';

const UserShip = sequelize.define('UserShip', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    level: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },
    customStats: {
        type: DataTypes.JSONB,
        defaultValue: {}
    }
}, {
    tableName: 'user_ships',
    underscored: true
});

export default UserShip;