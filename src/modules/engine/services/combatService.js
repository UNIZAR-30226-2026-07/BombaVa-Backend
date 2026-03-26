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
 * @param {Object} objetivo - Instancia de ShipInstance que recibe el daño
 * @param {number} danioDelArma - Cantidad de daño puro
 * @param {Object} transaccion - Transacción de Sequelize
 */
export const aplicarDañoImpacto = async (objetivo, danioDelArma, transaccion) => {
    let newHp = objetivo.currentHp - danioDelArma;
    if (newHp < 0) newHp = 0;

    const isSunk = newHp === 0;
    await objetivo.update({
        currentHp: newHp,
        isSunk: isSunk
    }, { transaccion });

    return { newHp, isSunk };
};