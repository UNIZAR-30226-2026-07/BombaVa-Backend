/**
 * Test de Integración: Persistencia de Proyectiles
 * Valida la comunicación con la base de datos para torpedos y minas.
 */
import { sequelize } from '../../../config/db.js';
import Projectile from './Projectile.js';

describe('Projectile Model Integration (Colocated)', () => {
    beforeAll(async () => {
        await sequelize.sync({ force: true });
    });

    afterAll(async () => {
        await sequelize.close();
    });

    it('Debe persistir un proyectil tipo TORPEDO con sus vectores', async () => {
        const p = await Projectile.create({
            matchId: '550e8400-e29b-41d4-a716-446655440000',
            ownerId: '550e8400-e29b-41d4-a716-446655440001',
            type: 'TORPEDO',
            x: 5, y: 5,
            vectorX: 0, vectorY: -1,
            lifeDistance: 6
        });

        expect(p.id).toBeDefined();
        expect(p.type).toBe('TORPEDO');
    });
});