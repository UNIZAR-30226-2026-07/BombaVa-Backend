/**
 * Registro central de modelos y asociaciones entre ellos
 */
const { sequelize } = require('../../config/db');

const User = require('../../modules/auth/models/User');
const ShipTemplate = require('../../modules/inventory/models/ShipTemplate');
const UserShip = require('../../modules/inventory/models/UserShip');
const FleetDeck = require('../../modules/inventory/models/FleetDeck');
const Match = require('../../modules/game/models/Match');
const MatchPlayer = require('../../modules/game/models/MatchPlayer');
const ShipInstance = require('../../modules/engine/models/ShipInstance');
const Projectile = require('../../modules/engine/models/Projectile');

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

module.exports = {
    sequelize, syncModels,
    User, ShipTemplate, UserShip, FleetDeck,
    Match, MatchPlayer, ShipInstance, Projectile
};