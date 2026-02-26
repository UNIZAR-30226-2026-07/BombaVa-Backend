/**
 * Test Unitario: Servicio de Debuffs
 * TODO: Valida que el esqueleto del servicio devuelva los modificadores por defecto.
 */
import { calcularModificadoresEstado } from './debuffService.js';

describe('DebuffService Unit Tests (Skeleton)', () => {
    it('calcularModificadoresEstado - Debe devolver penalizaciones en cero por defecto', () => {
        const mockShip = { hitCells: [] };
        const result = calcularModificadoresEstado(mockShip);

        expect(result.movePenalty).toBe(0);
        expect(result.visionPenalty).toBe(0);
        expect(result.damagePenalty).toBe(1.0);
    });
});