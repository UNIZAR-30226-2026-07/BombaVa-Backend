/**
 * Registro central de modelos y asociaciones entre ellos
 */
import { sequelize } from '../../config/db.js';
import User from '../../modules/auth/models/User.js';
import ShipTemplate from '../../modules/inventory/models/ShipTemplate.js';
import UserShip from '../../modules/inventory/models/UserShip.js';
import FleetDeck from '../../modules/inventory/models/FleetDeck.js';
import Match from '../../modules/game/models/Match.js';
import MatchPlayer from '../../modules/game/models/MatchPlayer.js';
import ShipInstance from '../../modules/engine/models/ShipInstance.js';
import Projectile from '../../modules/engine/models/Projectile.js';

// Relaciones de Usuario & Inventario
User.hasMany(UserShip, { foreignKey: 'user_id' });
UserShip.belongsTo(User, { foreignKey: 'user_id' });

ShipTemplate.hasMany(UserShip, { foreignKey: 'template_slug' });
UserShip.belongsTo(ShipTemplate, { foreignKey: 'template_slug' });

User.hasMany(FleetDeck, { foreignKey: 'user_id' });
FleetDeck.belongsTo(User, { foreignKey: 'user_id' });

// Relaciones de Partida & Jugadores
User.belongsToMany(Match, { through: MatchPlayer, foreignKey: 'user_id' });
Match.belongsToMany(User, { through: MatchPlayer, foreignKey: 'match_id' });

Match.belongsTo(User, { as: 'CurrentTurnPlayer', foreignKey: 'current_turn_player_id' });

// Relaciones sobre el juego
Match.hasMany(ShipInstance, { foreignKey: 'match_id' });
ShipInstance.belongsTo(Match, { foreignKey: 'match_id' });

MatchPlayer.hasMany(ShipInstance, { foreignKey: 'player_id' });
ShipInstance.belongsTo(MatchPlayer, { foreignKey: 'player_id' });

UserShip.hasMany(ShipInstance, { foreignKey: 'user_ship_id' });
ShipInstance.belongsTo(UserShip, { foreignKey: 'user_ship_id' });

Match.hasMany(Projectile, { foreignKey: 'match_id' });
Projectile.belongsTo(Match, { foreignKey: 'match_id' });

User.hasMany(Projectile, { as: 'FiredProjectiles', foreignKey: 'owner_id' });
Projectile.belongsTo(User, { as: 'Owner', foreignKey: 'owner_id' });

const syncModels = async () => {
    try {
        await sequelize.sync({ alter: true });
        console.log('Base de Datos: Esquema completo sincronizado.');
    } catch (error) {
        console.error('Base de Datos: Fallo en sincronización masiva:', error);
    }
};

export {
    sequelize,
    syncModels,
    User,
    ShipTemplate,
    UserShip,
    FleetDeck,
    Match,
    MatchPlayer,
    ShipInstance,
    Projectile
};