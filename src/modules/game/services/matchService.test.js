import { calcularRegeneracionTurno, traducirPosicionTablero } from './matchService.js';

describe('MatchService Unit Tests (Game Rules)', () => {

    it('Should translate South player positions correctly (inverted Y)', () => {
        const relativePos = { x: 5, y: 0 }; // Primera fila del mini-tablero
        const absolutePos = traducirPosicionTablero(relativePos, 'SOUTH');
        expect(absolutePos).toEqual({ x: 5, y: 14 }); // Última fila del mapa real
    });

    it('Should regenerate fuel by +10 but capped at 30', () => {
        const res1 = calcularRegeneracionTurno({ fuel: 10 });
        expect(res1.fuel).toBe(20);

        const res2 = calcularRegeneracionTurno({ fuel: 25 });
        expect(res2.fuel).toBe(30); // Cap at 30
    });

    it('Should reset ammo to 5 regardless of previous amount', () => {
        const res = calcularRegeneracionTurno({ fuel: 10, ammo: 0 });
        expect(res.ammo).toBe(5);
    });
});