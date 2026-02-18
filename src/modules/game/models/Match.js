import { DataTypes } from 'sequelize';
import { sequelize } from '../../../config/db.js';

const Match = sequelize.define('Match', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    status: {
        type: DataTypes.ENUM('WAITING', 'PLAYING', 'FINISHED'),
        defaultValue: 'WAITING',
        allowNull: false
    },
    turnNumber: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
        allowNull: false,
        validate: { min: 1 }
    },
    turnExpiresAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    mapTerrain: {
        type: DataTypes.JSONB,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    }
}, {
    tableName: 'matches',
    underscored: true
});

export default Match;