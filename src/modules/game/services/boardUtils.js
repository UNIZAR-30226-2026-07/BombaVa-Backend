/**
 * funciones para coordinar las rotaciones en tablero
 */
import { GAME_RULES } from '../../../config/gameRules.js';

export const traducirPosicionTablero = (pos, bando) => {
    return bando === 'NORTH' ? pos : { x: pos.x, y: (GAME_RULES.MAP.SIZE - 1) - pos.y };
};

export const traducirOrientacion = (orientacion, bando) => {
    if (bando === 'NORTH') return orientacion;
    const opuestos = { 'N': 'S', 'S': 'N', 'E': 'E', 'W': 'W' };
    return opuestos[orientacion] || orientacion;
};