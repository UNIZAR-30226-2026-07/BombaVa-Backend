import { DataTypes } from 'sequelize';
import { sequelize } from '../../../config/db.js';

const MatchPlayer = sequelize.define('MatchPlayer', {
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
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'user_id'
    },
    fuelReserve: {
        type: DataTypes.INTEGER,
        defaultValue: 100,
        allowNull: false,
        validate: { min: 0 }
    },
    ammoCurrent: {
        type: DataTypes.INTEGER,
        defaultValue: 10,
        allowNull: false,
        validate: { min: 0 }
    },
    side: {
        type: DataTypes.ENUM('NORTH', 'SOUTH'),
        allowNull: false
    },
    deckSnapshot: {
        type: DataTypes.JSONB,
        allowNull: true
    }
}, {
    tableName: 'match_players',
    underscored: true
});

export default MatchPlayer;