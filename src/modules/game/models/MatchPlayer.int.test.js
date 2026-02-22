/**
 * Test de Integración: Modelo de Jugador en Partida
 * Valida que los recursos no puedan ser negativos en la base de datos.
 */
import { sequelize } from '../../../config/db.js';
import MatchPlayer from './MatchPlayer.js';

describe('MatchPlayer Model Integration (Colocated)', () => {
    beforeAll(async () => {
        await sequelize.sync({ force: true });
    });

    afterAll(async () => {
        await sequelize.close();
    });

    it('Debe fallar si se intenta guardar combustible negativo', async () => {
        const mp = MatchPlayer.build({
            matchId: '550e8400-e29b-41d4-a716-446655440000',
            userId: '550e8400-e29b-41d4-a716-446655440001',
            side: 'NORTH',
            fuelReserve: -10
        });

        await expect(mp.save()).rejects.toThrow();
    });
});