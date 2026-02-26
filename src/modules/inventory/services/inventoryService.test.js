/**
 * Test Unitario: Servicio de Inventario
 * Valida las reglas de despliegue en el mini-tablero de la V1.
 */
import { validarLimitesPuerto } from './inventoryService.js';

describe('InventoryService Unit Tests (V1 Rules)', () => {
    it('validarLimitesPuerto - Debe rechazar barcos fuera del área 15x5', () => {
        const mazoInvalido = [
            { position: { x: 5, y: 10 } } // Y > 4 es inválido en V1
        ];
        expect(validarLimitesPuerto(mazoInvalido)).toBe(false);
    });

    it('validarLimitesPuerto - Debe aceptar barcos dentro del área 15x5', () => {
        const mazoValido = [
            { position: { x: 0, y: 0 } },
            { position: { x: 14, y: 4 } }
        ];
        expect(validarLimitesPuerto(mazoValido)).toBe(true);
    });
});