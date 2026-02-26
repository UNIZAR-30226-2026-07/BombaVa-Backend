/**
 * Fachada de configuración global.
 * Expone la conexión a base de datos y las reglas constantes de la V1.
 */
import { connectDB, sequelize } from './db.js';
import { GAME_RULES } from './gameRules.js';

export {
    connectDB,
    GAME_RULES, sequelize
};
