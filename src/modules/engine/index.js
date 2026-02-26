/**
 * Fachada raíz del módulo Engine.
 * Expone la interfaz pública del motor de juego hacia el resto del sistema.
 */
import Projectile from './models/Projectile.js';
import ShipInstance from './models/ShipInstance.js';
import { combatService, debuffService, engineService } from './services/index.js';
import { registerEngineHandlers } from './sockets/index.js';

export {
    combatService,
    debuffService, engineService, Projectile, registerEngineHandlers,
    ShipInstance
};
