/**
 * Lógica pura de gestión de partidas
 */

export const traducirPosicionInicial = (posicionRelativa, bando) => {
    if (bando === 'NORTH') return { x: posicionRelativa.x, y: posicionRelativa.y };
    return { x: posicionRelativa.x, y: 14 - posicionRelativa.y };
};

export const traducirOrientacionInicial = (orientacionRelativa, bando) => {
    if (bando === 'NORTH') return orientacionRelativa;
    return 'S';
};

export const calcularRegeneracionRecursos = (recursosActuales) => {
    return {
        fuel: Math.min(30, recursosActuales.fuel + 10),
        ammo: 5
    };
};