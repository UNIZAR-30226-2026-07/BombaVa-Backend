/**
 * Servicio de Estados y Debuffs.
 * TODO: Gestiona la lógica de penalizaciones basada en el daño localizado de los barcos.
 */

/**
 * Calcula modificadores de estadísticas según las celdas impactadas.
 * @param {Object} shipInstance 
 */
export const calcularModificadoresEstado = (shipInstance) => {
    return {
        movePenalty: 0,
        visionPenalty: 0,
        damagePenalty: 1.0
    };
};

/**
 * Registra un impacto en una sección específica del barco.
 * @param {Object} shipInstance 
 * @param {number} cellIndex 
 */
export const registrarDañoLocalizado = (shipInstance, cellIndex) => {
};