/**
 * Test de Integración: API de Inventario (Puerto)
 * Valida el listado de barcos y el equipamiento de armas contra la BD.
 */
import request from 'supertest';
import app from '../../../app.js';
import { sequelize } from '../../../config/db.js';
import { ShipTemplate, UserShip } from '../../../shared/models/index.js';
import User from '../../auth/models/User.js';
import { generarTokenAcceso } from '../../auth/services/authService.js';

describe('InventoryController API Integration (Colocated)', () => {
    let token, userId, shipId;

    beforeAll(async () => {
        await sequelize.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
        await sequelize.sync({ force: true });

        const user = await User.create({ username: 'capitan_test', email: 'cap@test.com', password_hash: '1' });
        userId = user.id;
        token = generarTokenAcceso(user);

        await ShipTemplate.create({ slug: 'fragata', name: 'Fragata', baseMaxHp: 30, supplyCost: 10 });
        const ship = await UserShip.create({ userId, templateSlug: 'fragata' });
        shipId = ship.id;
    });

    afterAll(async () => {
        await sequelize.close();
    });

    it('GET /api/inventory/ships - Debe listar los barcos del usuario con su plantilla', async () => {
        const res = await request(app)
            .get('/api/inventory/ships')
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body[0].templateSlug).toBe('fragata');
    });

    it('PATCH /api/inventory/ships/:id/equip - Debe equipar un arma y devolver el barco actualizado', async () => {
        const res = await request(app)
            .patch(`/api/inventory/ships/${shipId}/equip`)
            .set('Authorization', `Bearer ${token}`)
            .send({ weaponSlug: 'gran-cañon-v1' });

        expect(res.status).toBe(200);
        expect(res.body.customStats.equippedWeapon).toBe('gran-cañon-v1');
    });

    it('PATCH /api/inventory/ships/:id/equip - Debe dar 404 si el barco no existe', async () => {
        const fakeId = '550e8400-e29b-41d4-a716-446655449999';
        const res = await request(app)
            .patch(`/api/inventory/ships/${fakeId}/equip`)
            .set('Authorization', `Bearer ${token}`)
            .send({ weaponSlug: 'arma' });

        expect(res.status).toBe(404);
    });
});