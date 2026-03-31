/**
 * Test Unitario: Lógica de Servicio de Partida
 */
import { calcularRegeneracionTurno, traducirOrientacion, traducirPosicionTablero } from './matchService.js';

describe('MatchService Unit Tests (Pure Logic & Translation)', () => {

    it('traducirPosicionTablero - Debe invertir la coordenada Y para el bando SOUTH', () => {
        const relativePos = { x: 5, y: 0 }; 
        const northPos = traducirPosicionTablero(relativePos, 'NORTH');
        const southPos = traducirPosicionTablero(relativePos, 'SOUTH');

        expect(northPos).toEqual({ x: 5, y: 0 });
        expect(southPos).toEqual({ x: 5, y: 14 }); 
    });

    it('traducirOrientacion - Debe invertir Norte/Sur para el bando SOUTH', () => {
        expect(traducirOrientacion('N', 'NORTH')).toBe('N');
        expect(traducirOrientacion('N', 'SOUTH')).toBe('S');
        expect(traducirOrientacion('E', 'SOUTH')).toBe('E');
    });

    it('calcularRegeneracionTurno - Debe rellenar AP y MP a 10 según nuevas reglas', () => {
        const res1 = calcularRegeneracionTurno({ fuel: 2, ammo: 0 });
        expect(res1.fuel).toBe(10);
        expect(res1.ammo).toBe(10);
    });
});