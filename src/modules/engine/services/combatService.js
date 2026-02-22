/**
 * Lógica pura de combate y proyectiles
 */

export const validarRangoAtaque = (origen, destino, rangoMax) => {
    const distancia = Math.sqrt(Math.pow(destino.x - origen.x, 2) + Math.pow(destino.y - origen.y, 2));
    return distancia <= rangoMax;
};

export const calcularVectorProyectil = (orientacion) => {
    const vectores = {
        'N': { vx: 0, vy: -1 },
        'S': { vx: 0, vy: 1 },
        'E': { vx: 1, vy: 0 },
        'W': { vx: -1, vy: 0 }
    };
    return vectores[orientacion] || { vx: 0, vy: 0 };
};

export const validarAdyacencia = (pos1, pos2) => {
    const dx = Math.abs(pos1.x - pos2.x);
    const dy = Math.abs(pos1.y - pos2.y);
    return dx <= 1 && dy <= 1;
};

export const calcularDañoImpacto = (tipoArma) => {
    if (tipoArma === 'CANNON') return 10;
    return 0;
};