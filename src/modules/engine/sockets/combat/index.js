/**
 * Fachada interna de combate.
 */
import { handleCannonAttack } from './cannon.js';
import { handleMineDrop } from './mine.js';
import { handleTorpedoLaunch } from './torpedo.js';

export const registerCombatHandlers = (io, socket) => {
    socket.on('ship:attack:cannon', (data) => handleCannonAttack(io, socket, data));
    socket.on('ship:attack:torpedo', (data) => handleTorpedoLaunch(io, socket, data));
    socket.on('ship:attack:mine', (data) => handleMineDrop(io, socket, data));
};