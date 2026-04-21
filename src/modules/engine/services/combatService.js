/**
 * Servicio de Combate
 * Contiene la lógica pura de cálculos de daño, rangos y validaciones de ataque.
 */

/**
 * Valida si un ataque es posible según el rango y el estado del barco
 */
export const validarRangoAtaque = (origenes, destino, rangoMax) => {
    return origenes.some(origen => {
        const distancia = Math.sqrt(Math.pow(destino.x - origen.x, 2) + Math.pow(destino.y - origen.y, 2));
        return distancia <= rangoMax;
    });
};

/**
 * Calcula el vector de avance de un proyectil según su orientación
 */
export const calcularVectorProyectil = (orientacion) => {
    const vectores = {
        'N': { vx: 0, vy: 1 },
        'S': { vx: 0, vy: -1 },
        'E': { vx: 1, vy: 0 },
        'W': { vx: -1, vy: 0 }
    };
    return vectores[orientacion] || { vx: 0, vy: 0 };
};

/**
 * Valida si una posición es adyacente (radio 1)
 */
export const validarAdyacencia = (origenes, destino) => {
    return origenes.some(origen => {
        const dx = Math.abs(origen.x - destino.x);
        const dy = Math.abs(origen.y - destino.y);
        return dx <= 1 && dy <= 1;
    });
};

/**
 * Procesa el impacto de un arma sobre un objetivo
 * @param {Object} objetivo - Instancia de ShipInstance que recibe el daño
 * @param {number} danioDelArma - Cantidad de daño puro
 * @param {Object} transaccion - Transacción de Sequelize
 */
export const aplicarDanoImpacto = async (objetivo, danioDelArma, transaccion) => {
    let newHp = objetivo.currentHp - danioDelArma;
    if (newHp < 0) newHp = 0;

    const isSunk = newHp === 0;
    await objetivo.update({
        currentHp: newHp,
        isSunk: isSunk
    }, { transaccion });

    return { newHp, isSunk };
};

/**
 * Devuelve la posición en donde se ubica el frente del barco
 * @param {Int} x Posición x del centro del barco
 * @param {Int} y Posición y del centro del barco
 * @param {Char} orientacion Orientación que esta apuntando el barco
 * @param {Int} effectiveWidth Longitud del barco
 * @param {Int} effectiveHeight Altura del barco
 * @returns Las coordenadas del frente del barco
 */
export const obtenerFrente = (x, y, orientacion, effectiveWidth, effectiveHeight) => {
    let topx = x;
    let topy = y; 
    const offsetX = Math.floor(effectiveWidth / 2);
    const offsetY = Math.floor(effectiveHeight / 2);
    
    if (orientacion === 'N') {
        topy = y + offsetY;
    } else if (orientacion === 'S') {
        topy = y - offsetY;
    } else if (orientacion === 'E') {
        topx = x + offsetX;
    } else if (orientacion === 'W') {
        topx = x - offsetX;
    }
    if (topx < 0 || topy < 0) throw new Error('No se puede lanzar un torpedo en los límites del mapa');
    else return {topx, topy};
}

/**
 * Comprueba si un barco colisiona con un proyectil
 * @param {List<Object>} celdasBarco Todas las celdas que ocupa un barco
 * @param {List<Object>} allProyectiles Todos los proyectiles desplegado en el tablero
 * @returns True si colisiona un barco con un proyectil
 */
export const colisionBarcoProyectil = (celdasBarco, allProyectiles) => {
    for (const celda of celdasBarco){
        for (const proyectil of allProyectiles){
            if (celda.x === proyectil.x && celda.y === proyectil.y){
                return proyectil;
            }
        }
    }
    return null;
}