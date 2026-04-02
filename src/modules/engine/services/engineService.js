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
    if (dir === 'N') y += 1;
    if (dir === 'S') y -= 1;
    if (dir === 'E') x += 1;
    if (dir === 'W') x -= 1;
    return { x, y };
};

/**
 * Valida si una posición está dentro del mapa
 */
export const validarLimitesMapa = (celdas) => {
    const limit = GAME_RULES.MAP.SIZE - 1;
    return celdas.every(celda => 
        celda.x >= 0 && celda.x <= limit && 
        celda.y >= 0 && celda.y <= limit
    );
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

/**
 * Calcula todas las celdas ocupadas por un barco basándose en su origen, orientación y tamano
 */
export const calcularCeldasOcupadas = (centerX, centerY, effectiveWidth, effectiveHeight) => {
    const celdas = [];
    const startX = centerX - Math.floor(effectiveWidth / 2);
    const startY = centerY - Math.floor(effectiveHeight / 2);
    for (let i = 0; i < effectiveWidth; i++) {
        for (let j = 0; j < effectiveHeight; j++) {
            celdas.push({ 
                x: startX + i, 
                y: startY + j 
            });
        }
    }
    
    return celdas;
};

/**
 * Verifica si las celdas objetivo intersectan con algún barco vivo
 */
export const verificarColision = (targetCells, allAliveShips, ignoreShipId) => {
    for (const ship of allAliveShips) {
        if (ship.id === ignoreShipId) continue;

        const baseWidth = ship.UserShip.ShipTemplate.width;
        const baseHeight = ship.UserShip.ShipTemplate.height;
        const tamanoReal = calculartamanoEfectivo(baseWidth, baseHeight, ship.orientation);
        const occupiedCells = calcularCeldasOcupadas(
            ship.x, 
            ship.y, 
            tamanoReal.effectiveWidth, 
            tamanoReal.effectiveHeight
        );
        for (const tCell of targetCells) {
            for (const oCell of occupiedCells) {
                if (tCell.x === oCell.x && tCell.y === oCell.y) {
                    return true;
                }
            }
        }
    }
    
    return false; // Ninguna colisión
};

/**
 * Calcula el tamano efectivo de un barco 
 * basándose en sus dimensiones base y su orientación actual.
 * @param {number} width - Ancho base de la plantilla del barco.
 * @param {number} height - Alto base (largo) de la plantilla del barco.
 * @param {string} orientation - Orientación actual.
 * @returns {{ effectiveWidth: number, effectiveHeight: number }} Dimensiones reales en la cuadrícula.
 */
export const calculartamanoEfectivo = (width, height, orientation) => {
    if (!['N', 'S', 'E', 'W'].includes(orientation)) {
        return { effectiveWidth: width, effectiveHeight: height };
    }
    // Si el barco mira al Norte o al Sur, el eje X es el ancho y el eje Y es el alto
    if (orientation === 'N' || orientation === 'S') {
        return { 
            effectiveWidth: width, 
            effectiveHeight: height 
        };
    } 
    // Si el barco mira al Este o al Oeste, se invierten los ejes
    return { 
        effectiveWidth: height, 
        effectiveHeight: width 
    };
};
