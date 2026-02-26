/**
 * Test Unitario: Lógica de Combate
 * Valida cálculos de rango y vectores sin tocar la base de datos.
 */
import { calcularVectorProyectil, validarAdyacencia, validarRangoAtaque } from './combatService.js';

describe('CombatService Unit Tests (V1 Logic)', () => {
    it('validarRangoAtaque - Debe confirmar si el objetivo está a menos de 4 casillas', () => {
        const origen = { x: 0, y: 0 };
        const destinoCerca = { x: 2, y: 2 };
        const destinoLejos = { x: 10, y: 10 };

        expect(validarRangoAtaque(origen, destinoCerca, 4)).toBe(true);
        expect(validarRangoAtaque(origen, destinoLejos, 4)).toBe(false);
    });

    it('calcularVectorProyectil - Debe devolver vectorY -1 para orientación Norte', () => {
        const vector = calcularVectorProyectil('N');
        expect(vector).toEqual({ vx: 0, vy: -1 });
    });

    it('validarAdyacencia - Debe validar radio de 1 para colocar minas', () => {
        const barco = { x: 5, y: 5 };
        expect(validarAdyacencia(barco, { x: 6, y: 6 })).toBe(true);
        expect(validarAdyacencia(barco, { x: 7, y: 7 })).toBe(false);
    });
});