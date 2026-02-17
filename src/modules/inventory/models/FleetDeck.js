/**
 * FleetDeck Model
 * Almacena la configuración del mazo de la flota del usuario
 */
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
        allowNull: false
    },
    shipIds: {
        type: DataTypes.JSONB,
        allowNull: false
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    tableName: 'fleet_decks',
    underscored: true
});

export default FleetDeck;