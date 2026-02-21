import request from 'supertest';
import app from '../../../src/app.js';
import { sequelize, ShipTemplate, User, UserShip } from '../../../src/shared/models/index.js';

describe('Inventory API Functional Tests (Integration)', () => {
    let token, userId, shipId;

    beforeAll(async () => {
        await sequelize.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
        await sequelize.sync({ force: true });

        const userRes = await request(app).post('/api/auth/register').send({
            username: 'cap', email: 'cap@test.com', contrasena: 'Pass1234'
        });
        token = userRes.body.token;
        const user = await User.findOne({ where: { email: 'cap@test.com' } });
        userId = user.id;

        await ShipTemplate.create({ slug: 'fragata', name: 'Fragata', width: 1, height: 3, baseMaxHp: 30, supplyCost: 15 });

        const ship = await UserShip.create({
            userId: userId,
            templateSlug: 'fragata'
        });
        shipId = ship.id;
    });

    afterAll(async () => {
        await sequelize.close();
    });

    it('Debe devolver la lista de barcos del usuario autenticado', async () => {
        const response = await request(app)
            .get('/api/inventory/ships')
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body[0].templateSlug).toBe('fragata');
    });

    it('Debe equipar un arma correctamente en un barco propio', async () => {
        const response = await request(app)
            .patch(`/api/inventory/ships/${shipId}/equip`)
            .set('Authorization', `Bearer ${token}`)
            .send({ weaponSlug: 'canon-v1' });

        expect(response.status).toBe(200);
    });
});