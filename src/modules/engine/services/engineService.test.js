import { calcularRotacion, calcularTraslacion, validarLimitesMapa, calcularCeldasOcupadas, calculartamanoEfectivo, verificarColision } from './engineService.js';

describe('Tests unitarios de engineService', () => {

    describe('calcularTraslacion', () => {
        it('Debe calcular la traslación correctamente hacia el Norte', () => {
            const result = calcularTraslacion({ x: 5, y: 5 }, 'N');
            expect(result).toEqual({ x: 5, y: 6 });
        });

        it('Debe calcular la traslación correctamente hacia el Oeste', () => {
            const result = calcularTraslacion({ x: 5, y: 5 }, 'W');
            expect(result).toEqual({ x: 4, y: 5 });
        });
    });

    describe('validarLimitesMapa', () => {
        it('Debe devolver true si TODAS las celdas están dentro del mapa 15x15', () => {
            const celdasValidas = [{ x: 7, y: 7 }, { x: 0, y: 0 }, { x: 14, y: 14 }];
            expect(validarLimitesMapa(celdasValidas)).toBe(true);
        });

        it('Debe devolver false si ALGUNA celda tiene un valor negativo', () => {
            const celdasInvalidas = [{ x: 5, y: 5 }, { x: -1, y: 0 }];
            expect(validarLimitesMapa(celdasInvalidas)).toBe(false);
        });

        it('Debe devolver false si ALGUNA celda excede el límite del mapa (15)', () => {
            const celdasInvalidas = [{ x: 5, y: 15 }, { x: 10, y: 10 }];
            expect(validarLimitesMapa(celdasInvalidas)).toBe(false);
        });
    });

    describe('calcularRotacion', () => {
        it('Debe rotar 90 grados en sentido horario de Norte a Este', () => {
            const result = calcularRotacion('N', 90);
            expect(result).toBe('E');
        });

        it('Debe rotar -90 grados (antihorario) de Norte a Oeste', () => {
            const result = calcularRotacion('N', -90);
            expect(result).toBe('W');
        });
    });

    describe('calculartamanoEfectivo', () => {
        it('Debe mantener las dimensiones intactas si mira al Norte o al Sur', () => {
            const resultN = calculartamanoEfectivo(1, 3, 'N');
            expect(resultN).toEqual({ effectiveWidth: 1, effectiveHeight: 3 });

            const resultS = calculartamanoEfectivo(2, 4, 'S');
            expect(resultS).toEqual({ effectiveWidth: 2, effectiveHeight: 4 });
        });

        it('Debe invertir las dimensiones si mira al Este o al Oeste', () => {
            const resultE = calculartamanoEfectivo(1, 3, 'E');
            expect(resultE).toEqual({ effectiveWidth: 3, effectiveHeight: 1 });

            const resultW = calculartamanoEfectivo(2, 4, 'W');
            expect(resultW).toEqual({ effectiveWidth: 4, effectiveHeight: 2 });
        });
    });

    describe('calcularCeldasOcupadas', () => {
        it('Debe generar celdas correctas para un barco 1x1 en el centro', () => {
            const result = calcularCeldasOcupadas(5, 5, 1, 1);
            expect(result).toEqual([{ x: 5, y: 5 }]);
        });

        it('Debe calcular celdas desde el centro para un barco 1x3 (N/S)', () => {
            const result = calcularCeldasOcupadas(5, 5, 1, 3);
            expect(result).toEqual([
                { x: 5, y: 4 },
                { x: 5, y: 5 },
                { x: 5, y: 6 }
            ]);
        });

        it('Debe calcular celdas desde el centro para un barco 3x1 (E/W)', () => {
            const result = calcularCeldasOcupadas(5, 5, 3, 1);
            expect(result).toEqual([
                { x: 4, y: 5 },
                { x: 5, y: 5 },
                { x: 6, y: 5 }
            ]);
        });
    });

    describe('verificarColision', () => {
        const allAliveShips = [
            {
                id: 'mi-barco-id',
                x: 2, y: 2, orientation: 'N',
                UserShip: { ShipTemplate: { width: 1, height: 1 } }
            },
            {
                id: 'enemigo-1',
                x: 5, y: 5, orientation: 'N', // 1x3 -> Ocupará (5,4), (5,5), (5,6)
                UserShip: { ShipTemplate: { width: 1, height: 3 } }
            },
            {
                id: 'enemigo-2',
                x: 8, y: 8, orientation: 'E', // 1x3 rotado a E es 3x1 -> Ocupará (7,8), (8,8), (9,8)
                UserShip: { ShipTemplate: { width: 1, height: 3 } }
            }
        ];

        it('Debe devolver false (ignorar) si la colisión es con el propio barco', () => {
            const targetCells = [{ x: 2, y: 2 }];
            const colisiona = verificarColision(targetCells, allAliveShips, 'mi-barco-id');
            expect(colisiona).toBe(false);
        });

        it('Debe devolver true si choca con una celda extrema de un barco vertical', () => {
            const targetCells = [{ x: 5, y: 4 }];
            const colisiona = verificarColision(targetCells, allAliveShips, 'mi-barco-id');
            expect(colisiona).toBe(true);
        });

        it('Debe devolver true si choca con una celda de un barco horizontal', () => {
            const targetCells = [{ x: 9, y: 8 }];
            const colisiona = verificarColision(targetCells, allAliveShips, 'mi-barco-id');
            expect(colisiona).toBe(true);
        });

        it('Debe devolver false si las celdas están cerca pero no interceptan a nadie', () => {
            const targetCells = [{ x: 6, y: 5 }, { x: 7, y: 5 }];
            const colisiona = verificarColision(targetCells, allAliveShips, 'mi-barco-id');
            expect(colisiona).toBe(false);
        });
    });

});