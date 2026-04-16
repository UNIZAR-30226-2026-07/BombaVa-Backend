/**
 * Test Unitario: Lógica de Combate
 * Valida cálculos de rango y vectores sin tocar la base de datos.
 */
import { jest } from '@jest/globals';
import { calcularVectorProyectil, validarAdyacencia, validarRangoAtaque, aplicarDanoImpacto } from './combatService.js';

describe('CombatService Unit Tests (V2 Logic - Múltiples Celdas)', () => {
    
    describe('validarRangoAtaque', () => {
        it('Debe confirmar si el objetivo está a menos de 4 casillas (Barco 1x1)', () => {
            const origenes = [{ x: 0, y: 0 }];
            const destinoCerca = { x: 2, y: 2 };
            const destinoLejos = { x: 10, y: 10 };

            expect(validarRangoAtaque(origenes, destinoCerca, 4)).toBe(true);
            expect(validarRangoAtaque(origenes, destinoLejos, 4)).toBe(false);
        });

        it('Debe confirmar el ataque si AL MENOS UNA casilla del barco está en rango (Barco 1x3)', () => {
            // Un barco largo. Su proa está en (0,3), más cerca del objetivo.
            const origenes = [{ x: 0, y: 1 }, { x: 0, y: 2 }, { x: 0, y: 3 }];
            const destino = { x: 0, y: 7 };
            
            // Con rango 4, debe llegar porque cuenta desde la proa (0,3)
            expect(validarRangoAtaque(origenes, destino, 4)).toBe(true);
            // Con rango 3, no llega desde ninguna parte
            expect(validarRangoAtaque(origenes, destino, 3)).toBe(false);
        });
    });

    describe('calcularVectorProyectil', () => {
        it('Debe devolver vectorY 1 para orientación Norte', () => {
            const vector = calcularVectorProyectil('N');
            expect(vector).toEqual({ vx: 0, vy: 1 });
        });
    });

    describe('validarAdyacencia', () => {
        it('Debe validar radio de 1 para colocar minas (Barco 1x1)', () => {
            const barco = [{ x: 5, y: 5 }]; // Ahora es un array
            expect(validarAdyacencia(barco, { x: 6, y: 6 })).toBe(true);
            expect(validarAdyacencia(barco, { x: 7, y: 7 })).toBe(false);
        });

        it('Debe validar adyacencia desde cualquier casilla de un barco grande', () => {
            // Barco horizontal de 3x1 ocupando x: 5, 6 y 7
            const barco = [{ x: 5, y: 5 }, { x: 6, y: 5 }, { x: 7, y: 5 }];
            // Adyacente a la punta derecha (7,5)
            expect(validarAdyacencia(barco, { x: 8, y: 5 })).toBe(true);
            // Adyacente a la punta izquierda (5,5)
            expect(validarAdyacencia(barco, { x: 4, y: 5 })).toBe(true);
            // Demasiado lejos de cualquier parte
            expect(validarAdyacencia(barco, { x: 9, y: 5 })).toBe(false);
        });
    });

    describe('aplicarDanoImpacto', () => {
        it('Debe restar el daño dinámico correctamente y no hundir el barco si el HP es mayor a 0', async () => {
            const mockObjetivo = {
                currentHp: 50,
                isSunk: false,
                update: jest.fn().mockImplementation(function(data) {
                    Object.assign(this, data);
                    return Promise.resolve(this);
                })
            };

            const resultado = await aplicarDanoImpacto(mockObjetivo, 20, null);

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

            const resultado = await aplicarDanoImpacto(mockObjetivo, 50, null);

            expect(mockObjetivo.update).toHaveBeenCalled();
            expect(resultado.newHp).toBe(0);
            expect(resultado.isSunk).toBe(true);
        });
    });
});