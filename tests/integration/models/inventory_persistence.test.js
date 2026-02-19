import { sequelize, ShipTemplate, User, UserShip } from '../../../src/shared/models/index.js';

describe('Inventory Persistence (Integration)', () => {

    beforeAll(async () => {
        await sequelize.query('DROP SCHEMA public CASCADE;');
        await sequelize.query('CREATE SCHEMA public;');
        await sequelize.sync({ force: true });
    });

    afterAll(async () => {
        await sequelize.close();
    });

    it('Debe permitir a un usuario adquirir un barco basado en una plantilla', async () => {
        const user = await User.create({
            username: 'coleccionista',
            email: 'items@test.com',
            password_hash: 'hash'
        });

        const template = await ShipTemplate.create({
            slug: 'destructor',
            name: 'Destructor Clase A',
            width: 3,
            height: 1,
            baseMaxHp: 50,
            supplyCost: 20
        });

        const userShip = await UserShip.create({
            user_id: user.id,
            template_slug: template.slug,
            level: 1,
            customStats: { motor: 'v12' }
        });

        const savedItem = await UserShip.findByPk(userShip.id, {
            include: [User, ShipTemplate]
        });

        expect(savedItem.User.username).toBe('coleccionista');
        expect(savedItem.ShipTemplate.name).toBe('Destructor Clase A');
        expect(savedItem.customStats.motor).toBe('v12');
    });
});