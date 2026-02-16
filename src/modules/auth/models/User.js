/**
 * User Model
 */

import { DataTypes } from 'sequelize';
import { sequelize } from '../../../config/db.js';

const User = sequelize.define('User', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    password_hash: {
        type: DataTypes.STRING,
        allowNull: false
    },
    elo_rating: {
        type: DataTypes.INTEGER,
        defaultValue: 1200
    }
}, {
    tableName: 'users'
});

export default User;