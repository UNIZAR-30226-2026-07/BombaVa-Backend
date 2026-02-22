/**
 * Test Unitario: Servicio de Estado de Partida
 * Valida la lógica de derrota sin tocar la base de datos (Mocks).
 */
import { jest } from '@jest/globals';

jest.unstable_mockModule('../../../shared/models/index.js', () => ({
    ShipInstance: { count: jest.fn() },
    Match: { update: jest.fn() }
}));

const { verificarDerrotaJugador } = await import('./matchStatusService.js');
const { ShipInstance } = await import('../../../shared/models/index.js');

describe('MatchStatusService Unit Tests', () => {
    it('verificarDerrotaJugador - Debe devolver true si count es 0', async () => {
        ShipInstance.count.mockResolvedValue(0);
        const result = await verificarDerrotaJugador('m1', 'p1');
        expect(result).toBe(true);
    });

    it('verificarDerrotaJugador - Debe devolver false si hay barcos vivos', async () => {
        ShipInstance.count.mockResolvedValue(2);
        const result = await verificarDerrotaJugador('m1', 'p1');
        expect(result).toBe(false);
    });
});