/**
 * Fachada de Sockets del Módulo Engine.
 * Registra los manejadores de movimiento y combate.
 * 
 * @param {Object} io - Instancia de Socket.io.
 * @param {Object} socket - Socket del cliente.
 */
import { registerCombatHandlers } from './combat.js';
import { registerMovementHandlers } from './movement.js';

export const registerEngineHandlers = (io, socket) => {
    registerMovementHandlers(io, socket);
    registerCombatHandlers(io, socket);
};