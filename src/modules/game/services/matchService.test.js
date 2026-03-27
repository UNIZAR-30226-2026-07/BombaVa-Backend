import { calcularRegeneracionTurno, traducirPosicionTablero, traducirOrientacion } from './matchService.js';

describe('MatchService Unit Tests (Pure Logic & Translation)', () => {

    it('traducirPosicionTablero - Debe invertir la coordenada Y para el bando SOUTH', () => {
        const relativePos = { x: 5, y: 0 }; 
        const northPos = traducirPosicionTablero(relativePos, 'NORTH');
        const southPos = traducirPosicionTablero(relativePos, 'SOUTH');

        expect(northPos).toEqual({ x: 5, y: 0 });
        expect(southPos).toEqual({ x: 5, y: 14 }); // 15 - 1 - 0 = 14
    });

    it('traducirOrientacion - Debe invertir Norte/Sur para el bando SOUTH', () => {
        expect(traducirOrientacion('N', 'NORTH')).toBe('N');
        expect(traducirOrientacion('N', 'SOUTH')).toBe('S');
        
        expect(traducirOrientacion('E', 'SOUTH')).toBe('E'); // El Este y Oeste no se invierten
    });

    it('calcularRegeneracionTurno - Debe rellenar AP y sumar MP limitados a 30', () => {
        const res1 = calcularRegeneracionTurno({ fuel: 10, ammo: 0 });
        expect(res1.fuel).toBe(20);
        expect(res1.ammo).toBe(5);

        const res2 = calcularRegeneracionTurno({ fuel: 25, ammo: 3 });
        expect(res2.fuel).toBe(30); // Cap at 30
        expect(res2.ammo).toBe(5);
    });
});