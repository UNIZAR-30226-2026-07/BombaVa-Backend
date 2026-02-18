import { DataTypes } from 'sequelize';
import { sequelize } from '../../../config/db.js';

const FleetDeck = sequelize.define('FleetDeck', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    deckName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: { msg: "El nombre del mazo no puede estar vacío" },
            len: [3, 30]
        }
    },
    shipIds: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: [],
        validate: {
            isValidArray(value) {
                if (!Array.isArray(value)) {
                    throw new Error('shipIds debe ser un array de UUIDs');
                }
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