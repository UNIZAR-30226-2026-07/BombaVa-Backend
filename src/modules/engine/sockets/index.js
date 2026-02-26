/**
 * Fachada de Sockets del Módulo Engine.
 * Coordina los manejadores de movimiento y la nueva estructura segmentada de combate.
 */
import { registerCombatHandlers } from './combat/index.js';
import { registerMovementHandlers } from './movement.js';

export const registerEngineHandlers = (io, socket) => {
    registerMovementHandlers(io, socket);
    registerCombatHandlers(io, socket);
};