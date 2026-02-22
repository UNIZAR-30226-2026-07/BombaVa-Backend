/**
 * Test de Integración: Persistencia de Barcos de Usuario
 * Valida que los barcos se guarden asociados a una plantilla (Template).
 */
import { sequelize } from '../../../config/db.js';
import ShipTemplate from './ShipTemplate.js';
import UserShip from './UserShip.js';

describe('UserShip Model Integration (Colocated)', () => {
    beforeAll(async () => {
        await sequelize.sync({ force: true });
        await ShipTemplate.create({ slug: 'fragata', name: 'Fragata', baseMaxHp: 30, supplyCost: 10 });
    });

    afterAll(async () => {
        await sequelize.close();
    });

    it('Debe persistir un barco vinculándolo al slug de una plantilla existente', async () => {
        const ship = await UserShip.create({
            userId: '550e8400-e29b-41d4-a716-446655440001',
            templateSlug: 'fragata',
            level: 5,
            customStats: { motor: 'nuclear' }
        });

        expect(ship.id).toBeDefined();
        expect(ship.templateSlug).toBe('fragata');
    });
});