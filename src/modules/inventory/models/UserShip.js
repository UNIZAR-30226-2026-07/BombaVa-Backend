import { DataTypes } from 'sequelize';
import { sequelize } from '../../../config/db.js';

const UserShip = sequelize.define('UserShip', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'user_id'
    },
    templateSlug: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'template_slug'
    },
    level: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: { min: 1 }
    },
    customStats: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: {}
    }
}, {
    tableName: 'user_ships',
    underscored: true
});

export default UserShip;