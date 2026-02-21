import { DataTypes } from 'sequelize';
import { sequelize } from '../../../config/db.js';

const FleetDeck = sequelize.define('FleetDeck', {
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
    deckName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [3, 30]
        }
    },
    shipIds: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: [],
        validate: {
            isArray(value) {
                if (!Array.isArray(value)) throw new Error('shipIds debe ser un array de UUIDs');
            }
        }
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
}, {
    tableName: 'fleet_decks',
    underscored: true
});

export default FleetDeck;