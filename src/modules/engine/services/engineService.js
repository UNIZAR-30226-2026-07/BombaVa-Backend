/**
 * Servicio que contiene la lógica pura del motor de juego
 */

export const calcularTraslacion = (posicionActual, direccion) => {
    let { x, y } = posicionActual;
    if (direccion === 'N') y -= 1;
    if (direccion === 'S') y += 1;
    if (direccion === 'E') x += 1;
    if (direccion === 'W') x -= 1;
    return { x, y };
};

export const validarLimitesMapa = (x, y) => {
    return x >= 0 && x <= 14 && y >= 0 && y <= 14;
};

export const calcularRotacion = (orientacionActual, grados) => {
    const orientaciones = ['N', 'E', 'S', 'W'];
    let index = orientaciones.indexOf(orientacionActual);
    if (grados === 90) index = (index + 1) % 4;
    else index = (index + 3) % 4;
    return orientaciones[index];
};