import { calcularRotacion, calcularTraslacion, validarLimitesMapa } from './engineService.js';

describe('EngineService Unit Tests (Pure Logic)', () => {

    it('Should calculate translation correctly to the North', () => {
        const result = calcularTraslacion({ x: 5, y: 5 }, 'N');
        expect(result).toEqual({ x: 5, y: 4 });
    });

    it('Should detect coordinates outside the 15x15 map', () => {
        expect(validarLimitesMapa(-1, 0)).toBe(false);
        expect(validarLimitesMapa(15, 15)).toBe(false);
        expect(validarLimitesMapa(7, 7)).toBe(true);
    });

    it('Should rotate 90 degrees clockwise from North to East', () => {
        const result = calcularRotacion('N', 90);
        expect(result).toBe('E');
    });

    it('Should rotate -90 degrees from North to West', () => {
        const result = calcularRotacion('N', -90);
        expect(result).toBe('W');
    });
});