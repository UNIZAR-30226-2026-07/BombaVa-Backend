/**
 * Registro central de modelos y asociaciones entre ellos
 */
import { sequelize } from '../../config/db.js';
import User from '../../modules/auth/models/User.js';
import Projectile from '../../modules/engine/models/Projectile.js';
import ShipInstance from '../../modules/engine/models/ShipInstance.js';
import Match from '../../modules/game/models/Match.js';
import MatchPlayer from '../../modules/game/models/MatchPlayer.js';
import FleetDeck from '../../modules/inventory/models/FleetDeck.js';
import ShipTemplate from '../../modules/inventory/models/ShipTemplate.js';
import UserShip from '../../modules/inventory/models/UserShip.js';

// --- 1. Relaciones de Usuario e Inventario ---
User.hasMany(UserShip, { foreignKey: 'userId' });
UserShip.belongsTo(User, { foreignKey: 'userId' });

ShipTemplate.hasMany(UserShip, { foreignKey: 'templateSlug' });
UserShip.belongsTo(ShipTemplate, { foreignKey: 'templateSlug' });

User.hasMany(FleetDeck, { foreignKey: 'userId' });
FleetDeck.belongsTo(User, { foreignKey: 'userId' });

// --- 2. Relaciones de Partida (Junction Table) ---
User.belongsToMany(Match, {
    through: MatchPlayer,
    foreignKey: 'userId',
    otherKey: 'matchId'
});
Match.belongsToMany(User, {
    through: MatchPlayer,
    foreignKey: 'matchId',
    otherKey: 'userId'
});

// Relación de turno
Match.belongsTo(User, { as: 'CurrentTurnPlayer', foreignKey: 'currentTurnPlayerId' });

// --- 3. Relaciones de Gameplay ---
Match.hasMany(ShipInstance, { foreignKey: 'matchId' });
ShipInstance.belongsTo(Match, { foreignKey: 'matchId' });

User.hasMany(ShipInstance, { foreignKey: 'playerId' });
ShipInstance.belongsTo(User, { foreignKey: 'playerId' });

UserShip.hasMany(ShipInstance, { foreignKey: 'userShipId' });
ShipInstance.belongsTo(UserShip, { foreignKey: 'userShipId' });

// --- 4. Relaciones de Proyectiles ---
Match.hasMany(Projectile, { foreignKey: 'matchId' });
Projectile.belongsTo(Match, { foreignKey: 'matchId' });

User.hasMany(Projectile, { as: 'FiredProjectiles', foreignKey: 'ownerId' });
Projectile.belongsTo(User, { as: 'Owner', foreignKey: 'ownerId' });

/**
 * Sincroniza los modelos con la base de datos
 */
const syncModels = async () => {
    try {
        await sequelize.sync({ alter: true });
        console.log('Base de Datos: Esquema completo sincronizado.');
    } catch (error) {
        console.error('Base de Datos: Fallo en sincronización:', error);
        throw error;
    }
};

export {
    FleetDeck, Match, MatchPlayer, Projectile, sequelize,
    ShipInstance, ShipTemplate, syncModels, User, UserShip
};
