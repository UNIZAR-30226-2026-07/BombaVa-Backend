/**
 * Test Unitario: Servicio de Usuario (Lógica de ELO y Perfil)
 */
import { jest } from '@jest/globals';

jest.unstable_mockModule('../models/User.js', () => ({
    default: {
        findByPk: jest.fn()
    }
}));

const { procesarResultadoElo, actualizarPerfil } = await import('./userService.js');
const User = (await import('../models/User.js')).default;

describe('UserService Logic Tests', () => {
    afterEach(() => jest.clearAllMocks());

    it('procesarResultadoElo - Debe aumentar el ELO del ganador y bajar el del perdedor', async () => {
        const winner = { id: 'w1', elo_rating: 1200, update: jest.fn() };
        const loser = { id: 'l1', elo_rating: 1200, update: jest.fn() };

        User.findByPk.mockImplementation((id) => id === 'w1' ? winner : loser);

        await procesarResultadoElo('w1', 'l1');

        expect(winner.update).toHaveBeenCalledWith(expect.objectContaining({
            elo_rating: expect.any(Number)
        }));
        expect(winner.update.mock.calls[0][0].elo_rating).toBe(1216);
        expect(loser.update.mock.calls[0][0].elo_rating).toBe(1184);
    });

    it('actualizarPerfil - Debe llamar al método update del modelo', async () => {
        const user = { id: 'u1', update: jest.fn() };
        User.findByPk.mockResolvedValue(user);

        await actualizarPerfil('u1', { username: 'nuevo' });
        expect(user.update).toHaveBeenCalledWith({ username: 'nuevo' });
    });
});