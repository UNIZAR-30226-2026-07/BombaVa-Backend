import request from 'supertest';
import app from '../../../src/app.js';
import { sequelize, ShipTemplate, User, UserShip } from '../../../src/shared/models/index.js';

describe('Inventory API Functional Tests (Integration)', () => {
    let token;
    let userId;
    let shipId;

    beforeAll(async () => {
        await sequelize.query('DROP SCHEMA public CASCADE;');
        await sequelize.query('CREATE SCHEMA public;');
        await sequelize.sync({ force: true });

        const userRes = await request(app).post('/api/auth/register').send({
            username: 'captain_test',
            email: 'captain@test.com',
            contrasena: 'Pass1234'
        });
        token = userRes.body.token;
        const user = await User.findOne({ where: { email: 'captain@test.com' } });
        userId = user.id;

        await ShipTemplate.create({
            slug: 'fragata',
            name: 'Fragata Ligera',
            width: 1,
            height: 3,
            baseMaxHp: 30,
            supplyCost: 15
        });

        const ship = await UserShip.create({
            user_id: userId,
            template_slug: 'fragata'
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
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body[0].template_slug).toBe('fragata');
    });

    it('Debe equipar un arma correctamente en un barco propio', async () => {
        const response = await request(app)
            .patch(`/api/inventory/ships/${shipId}/equip`)
            .set('Authorization', `Bearer ${token}`)
            .send({ weaponSlug: 'canon-heavy-v1' });

        expect(response.status).toBe(200);
        expect(response.body.customStats.equippedWeapon).toBe('canon-heavy-v1');
    });

    it('Debe denegar el acceso si no hay token', async () => {
        const response = await request(app).get('/api/inventory/ships');
        expect(response.status).toBe(401);
    });
});