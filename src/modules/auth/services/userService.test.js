/**
 * Test Unitario: Servicio de Usuario
 * Prueba la lógica de negocio aislando la base de datos con Mocks.
 */
import { jest } from '@jest/globals';

jest.unstable_mockModule('../models/User.js', () => ({
    default: {
        findByPk: jest.fn(),
        findAll: jest.fn()
    }
}));

const { obtenerPerfilPrivado, obtenerClasificacionGlobal } = await import('./userService.js');
const User = (await import('../models/User.js')).default;

describe('UserService Unit Tests (Logic only)', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('obtenerPerfilPrivado - Debe llamar al modelo con el ID correcto', async () => {
        User.findByPk.mockResolvedValue({ id: '1', username: 'test' });

        await obtenerPerfilPrivado('1');

        expect(User.findByPk).toHaveBeenCalledWith('1', expect.any(Object));
    });

    it('obtenerClasificacionGlobal - Debe solicitar ordenación por ELO descendente', async () => {
        User.findAll.mockResolvedValue([]);

        await obtenerClasificacionGlobal(10);

        expect(User.findAll).toHaveBeenCalledWith(expect.objectContaining({
            order: [['elo_rating', 'DESC']],
            limit: 10
        }));
    });
});