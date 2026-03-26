/**
 * Test Unitario: Lógica de Combate
 * Valida cálculos de rango y vectores sin tocar la base de datos.
 */
import { jest } from '@jest/globals';
import { calcularVectorProyectil, validarAdyacencia, validarRangoAtaque, aplicarDañoImpacto} from './combatService.js';

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

describe('aplicarDañoImpacto', () => {
    it('Debe restar el daño dinámico correctamente y no hundir el barco si el HP es mayor a 0', async () => {
        const mockObjetivo = {
            currentHp: 50,
            isSunk: false,
            update: jest.fn().mockImplementation(function(data) {
                Object.assign(this, data);
                return Promise.resolve(this);
            })
        };

        // Simulamos el impacto de un arma ligera que hace 20 de daño
        const resultado = await aplicarDañoImpacto(mockObjetivo, 20, null);

        expect(mockObjetivo.update).toHaveBeenCalled();
        expect(resultado.newHp).toBe(30);
        expect(resultado.isSunk).toBe(false);
    });

    it('Debe hundir el barco si el daño supera el HP actual', async () => {
        const mockObjetivo = {
            currentHp: 30,
            isSunk: false,
            update: jest.fn().mockResolvedValue()
        };

        // Simulamos el impacto de un torpedo pesado que hace 50 de daño
        const resultado = await aplicarDañoImpacto(mockObjetivo, 50, null);

        expect(mockObjetivo.update).toHaveBeenCalled();
        expect(resultado.newHp).toBe(0);
        expect(resultado.isSunk).toBe(true);
    });
});