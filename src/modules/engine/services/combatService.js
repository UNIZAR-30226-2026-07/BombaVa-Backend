/**
 * Servicio de Combate
 * Contiene la lógica pura de cálculos de daño, rangos y validaciones de ataque.
 */

/**
 * Valida si un ataque es posible según el rango y el estado del barco
 */
export const validarRangoAtaque = (origen, destino, rangoMax) => {
    const distancia = Math.sqrt(Math.pow(destino.x - origen.x, 2) + Math.pow(destino.y - origen.y, 2));
    return distancia <= rangoMax;
};

/**
 * Calcula el vector de avance de un proyectil según su orientación
 */
export const calcularVectorProyectil = (orientacion) => {
    const vectores = {
        'N': { vx: 0, vy: -1 },
        'S': { vx: 0, vy: 1 },
        'E': { vx: 1, vy: 0 },
        'W': { vx: -1, vy: 0 }
    };
    return vectores[orientacion] || { vx: 0, vy: 0 };
};

/**
 * Valida si una posición es adyacente (radio 1)
 */
export const validarAdyacencia = (pos1, pos2) => {
    const dx = Math.abs(pos1.x - pos2.x);
    const dy = Math.abs(pos1.y - pos2.y);
    return dx <= 1 && dy <= 1;
};

/**
 * Procesa el impacto de un arma sobre un objetivo
 * @param {Object} objetivo - Instancia de ShipInstance
 * @param {string} tipoArma - 'CANNON', 'TORPEDO', 'MINE'
 */
export const aplicarDañoImpacto = async (objetivo, tipoArma, transaccion) => {
    const DAÑOS = {
        'CANNON': 10,
        'TORPEDO': 20,
        'MINE': 25
    };

    const dañoFinal = DAÑOS[tipoArma] || 0;
    objetivo.currentHp = Math.max(0, objetivo.currentHp - dañoFinal);

    if (objetivo.currentHp === 0) {
        objetivo.isSunk = true;
    }

    return await objetivo.save({ transaction: transaccion });
};

/**
 * Devuelve los costes de munición de la V1
 */
export const obtenerCostesCombate = () => {
    return {
        CANNON: 2,
        TORPEDO: 3,
        MINE: 2
    };
};