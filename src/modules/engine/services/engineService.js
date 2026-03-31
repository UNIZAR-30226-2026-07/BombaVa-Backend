/**
 * Servicio de Lógica del Motor (EngineService)
 * Gestiona movimientos, rotaciones, colisiones y límites.
 */
import { GAME_RULES } from '../../../config/gameRules.js';

/**
 * Calcula la traslación de coordenadas
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
 * Valida si una posición está dentro del mapa 15x15
 */
export const validarLimitesMapa = (x, y) => {
    const limit = GAME_RULES.MAP.SIZE - 1;
    return x >= 0 && x <= limit && y >= 0 && y <= limit;
};

/**
 * Calcula la nueva orientación cardinal
 */
export const calcularRotacion = (actual, grados) => {
    const orden = ['N', 'E', 'S', 'W'];
    let idx = orden.indexOf(actual);
    if (grados === 90) idx = (idx + 1) % 4;
    else idx = (idx + 3) % 4;
    return orden[idx];
};

/**
 * Devuelve los costes estandarizados de la V1
 */
export const obtenerCostesMovimiento = () => {
    return {
        TRASLACION: GAME_RULES.RESOURCES.COST_MOVE,
        ROTACION: GAME_RULES.RESOURCES.COST_ROTATE
    };
};

/**
 * Calcula todas las celdas ocupadas por un barco basándose en su origen, orientación y tamaño
 */
export const calcularCeldasOcupadas = (startX, startY, orientation, size) => {
    const celdas = [];
    const esHorizontal = orientation === 'E' || orientation === 'W';
    
    for (let i = 0; i < size; i++) {
        celdas.push({
            x: esHorizontal ? startX + i : startX,
            y: esHorizontal ? startY : startY + i
        });
    }
    return celdas;
};

/**
 * Verifica si las celdas objetivo intersectan con algún barco vivo
 */
export const verificarColision = (targetCells, allAliveShips, ignoreShipId) => {
    for (const ship of allAliveShips) {
        if (ship.id === ignoreShipId) continue;
        
        const size = Math.max(ship.UserShip.ShipTemplate.width, ship.UserShip.ShipTemplate.height);
        const occupiedCells = calcularCeldasOcupadas(ship.x, ship.y, ship.orientation, size);
        
        for (const tCell of targetCells) {
            for (const oCell of occupiedCells) {
                if (tCell.x === oCell.x && tCell.y === oCell.y) {
                    return true; 
                }
            }
        }
    }
    return false;
};

/**
 * Traduce comandos de dirección del jugador Sur (Vista invertida)
 */
export const traducirDireccionEntrada = (inputDirection, playerSide) => {
    if (playerSide === 'NORTH') return inputDirection;
    
    const invertY = { 'N': 'S', 'S': 'N', 'E': 'E', 'W': 'W' };
    return invertY[inputDirection] || inputDirection;
};