/**
 * Modelo MatchPlayer
 * Representa el estado de un jugador dentro de una partida específica.
 */
import { DataTypes } from 'sequelize';
import { sequelize } from '../../../config/db.js';
import { GAME_RULES } from '../../../config/gameRules.js';

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
        defaultValue: GAME_RULES.RESOURCES.MAX_FUEL,
        allowNull: false,
        validate: { min: 0 }
    },
    ammoCurrent: {
        type: DataTypes.INTEGER,
        defaultValue: GAME_RULES.RESOURCES.RESET_AMMO,
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