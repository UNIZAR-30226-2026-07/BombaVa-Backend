/**
 * Servicio de Lógica del Motor (EngineService)
 * Gestiona movimientos, rotaciones y validaciones de límites de tablero.
 */
import { GAME_RULES } from '../../../config/gameRules.js';

/**
 * Calcula la traslación de coordenadas
 * @param {Object} pos - {x, y}
 * @param {string} dir - N, S, E, W
 */
export const calcularTraslacion = (pos, dir) => {
    let { x, y } = pos;
    if (dir === 'N') y -= 1;
    if (dir === 'S') y += 1;
    if (dir === 'E') x += 1;
    if (dir === 'W') x -= 1;
    return { x, y };
};

/**
 * Valida si una posición está dentro del mapa
 */
export const validarLimitesMapa = (x, y) => {
    const limit = GAME_RULES.MAP.SIZE - 1;
    return x >= 0 && x <= limit && y >= 0 && y <= limit;
};

/**
 * Calcula la nueva orientación
 * @param {string} actual - N, S, E, W
 * @param {number} grados - 90, -90
 */
export const calcularRotacion = (actual, grados) => {
    const orden = ['N', 'E', 'S', 'W'];
    let idx = orden.indexOf(actual);
    if (grados === 90) idx = (idx + 1) % 4;
    else idx = (idx + 3) % 4;
    return orden[idx];
};

/**
 * Devuelve los costes estandarizados
 */
export const obtenerCostesMovimiento = () => {
    return {
        TRASLACION: GAME_RULES.RESOURCES.COST_MOVE,
        ROTACION: GAME_RULES.RESOURCES.COST_ROTATE
    };
};