/**
 * Fachada de servicios del motor de juego.
 * Unifica el acceso a la lógica de movimiento, combate y estados.
 */
import * as combatService from './combatService.js';
import * as debuffService from './debuffService.js';
import * as engineService from './engineService.js';

export {
    combatService,
    debuffService, engineService
};
