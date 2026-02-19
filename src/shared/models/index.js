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
User.hasMany(UserShip, { foreignKey: 'user_id' });
UserShip.belongsTo(User, { foreignKey: 'user_id' });

ShipTemplate.hasMany(UserShip, { foreignKey: 'template_slug' });
UserShip.belongsTo(ShipTemplate, { foreignKey: 'template_slug' });

User.hasMany(FleetDeck, { foreignKey: 'user_id' });
FleetDeck.belongsTo(User, { foreignKey: 'user_id' });

// --- 2. Relaciones de Partida (Junction Table) ---
User.belongsToMany(Match, { through: MatchPlayer, foreignKey: 'user_id' });
Match.belongsToMany(User, { through: MatchPlayer, foreignKey: 'match_id' });
Match.belongsTo(User, { as: 'CurrentTurnPlayer', foreignKey: 'current_turn_player_id' });

// --- 3. Relaciones de Gameplay  ---
Match.hasMany(ShipInstance, { foreignKey: 'match_id' });
ShipInstance.belongsTo(Match, { foreignKey: 'match_id' });
User.hasMany(ShipInstance, { foreignKey: 'player_id' });
ShipInstance.belongsTo(User, { foreignKey: 'player_id' });
UserShip.hasMany(ShipInstance, { foreignKey: 'user_ship_id' });
ShipInstance.belongsTo(UserShip, { foreignKey: 'user_ship_id' });

// --- 4. Relaciones de Proyectiles ---
Match.hasMany(Projectile, { foreignKey: 'match_id' });
Projectile.belongsTo(Match, { foreignKey: 'match_id' });

User.hasMany(Projectile, { as: 'FiredProjectiles', foreignKey: 'owner_id' });
Projectile.belongsTo(User, { as: 'Owner', foreignKey: 'owner_id' });

const syncModels = async () => {
    try {
        await sequelize.sync({ alter: true }); // En desarrollo, usamos alter:true. force:true es muy agresivo con los ENUMs de Postgres
        console.log('Base de Datos: Esquema completo sincronizado.');
    } catch (error) {
        console.error('Base de Datos: Fallo en sincronización masiva:', error);
        throw error;
    }
};

export {
    FleetDeck,
    Match,
    MatchPlayer, Projectile, sequelize, ShipInstance, ShipTemplate, syncModels,
    User, UserShip
};
