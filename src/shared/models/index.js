/**
 * Registro central de modelos y asociaciones.
 * Utiliza fachadas de módulos para la importación.
 */
import { sequelize } from '../../config/db.js';
import { User } from '../../modules/auth/index.js';
import { Projectile, ShipInstance } from '../../modules/engine/index.js';
import { Match, MatchPlayer } from '../../modules/game/index.js';
import { FleetDeck, ShipTemplate, UserShip } from '../../modules/inventory/index.js';

// 1. Relaciones de Usuario e Inventario
User.hasMany(UserShip, { foreignKey: 'userId' });
UserShip.belongsTo(User, { foreignKey: 'userId' });

ShipTemplate.hasMany(UserShip, { foreignKey: 'templateSlug' });
UserShip.belongsTo(ShipTemplate, { foreignKey: 'templateSlug' });

User.hasMany(FleetDeck, { foreignKey: 'userId' });
FleetDeck.belongsTo(User, { foreignKey: 'userId' });

// 2. Relaciones de Partida
User.belongsToMany(Match, { through: MatchPlayer, foreignKey: 'userId', otherKey: 'matchId' });
Match.belongsToMany(User, { through: MatchPlayer, foreignKey: 'matchId', otherKey: 'userId' });

Match.hasMany(MatchPlayer, { foreignKey: 'matchId' });
MatchPlayer.belongsTo(Match, { foreignKey: 'matchId' });
User.hasMany(MatchPlayer, { foreignKey: 'userId' });
MatchPlayer.belongsTo(User, { foreignKey: 'userId' });

// 3. Relaciones de Gameplay
Match.hasMany(ShipInstance, { foreignKey: 'matchId' });
ShipInstance.belongsTo(Match, { foreignKey: 'matchId' });

User.hasMany(ShipInstance, { foreignKey: 'playerId' });
ShipInstance.belongsTo(User, { foreignKey: 'playerId' });

UserShip.hasMany(ShipInstance, { foreignKey: 'userShipId' });
ShipInstance.belongsTo(UserShip, { foreignKey: 'userShipId' });

// 4. Relaciones de Proyectiles
Match.hasMany(Projectile, { foreignKey: 'matchId' });
Projectile.belongsTo(Match, { foreignKey: 'matchId' });

User.hasMany(Projectile, { as: 'FiredProjectiles', foreignKey: 'ownerId' });
Projectile.belongsTo(User, { as: 'Owner', foreignKey: 'ownerId' });

const syncModels = async () => {
    try {
        await sequelize.sync({ alter: true });
        console.log('Base de Datos: Esquema sincronizado vía fachadas.');
    } catch (error) {
        console.error('Base de Datos: Fallo en sincronización:', error);
        throw error;
    }
};

export {
    FleetDeck, Match, MatchPlayer, Projectile, sequelize,
    ShipInstance, ShipTemplate, syncModels, User, UserShip
};
