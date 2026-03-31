/**
 * Fachada del socket de movimiento refactorizado.
 */
import { handleMove } from './moveHandler.js';
import { handleRotate } from './rotateHandler.js';

export const registerMovementHandlers = (io, socket) => {
    socket.on('ship:move', (data) => handleMove(io, socket, data));
    socket.on('ship:rotate', (data) => handleRotate(io, socket, data));
};