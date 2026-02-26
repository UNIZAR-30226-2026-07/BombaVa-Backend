/**
 * Modelo de Mazo de Flota (FleetDeck)
 */
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
            len: [3, 30]
        }
    },
    shipIds: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: [],
        validate: {
            isValidFormation(value) {
                if (!Array.isArray(value)) {
                    throw new Error('shipIds debe ser un array de UUIDs');
                }
                value.forEach(ship => {
                    if (!ship.userShipId || !ship.position || !ship.orientation) {
                        throw new Error('Cada barco debe tener ID, posición y orientación');
                    }
                });
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