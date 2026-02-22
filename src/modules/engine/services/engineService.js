/**
 * Servicio de Lógica del Motor (EngineService)
 * Contiene los cálculos de traslación, rotación y validación de límites.
 */

/**
 * Calcula la nueva posición basada en una dirección
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
 * Valida si las coordenadas están dentro del tablero (Exportación requerida por tests)
 */
export const validarLimitesMapa = (x, y) => {
    return x >= 0 && x <= 14 && y >= 0 && y <= 14;
};

/**
 * Calcula la nueva orientación tras una rotación de 90 grados
 */
export const calcularRotacion = (actual, grados) => {
    const orden = ['N', 'E', 'S', 'W'];
    let idx = orden.indexOf(actual);
    if (grados === 90) idx = (idx + 1) % 4;
    else idx = (idx + 3) % 4;
    return orden[idx];
};

/**
 * Devuelve los costes de recursos según la V1
 */
export const obtenerCostesMovimiento = () => {
    return {
        TRASLACION: 1,
        ROTACION: 2
    };
};