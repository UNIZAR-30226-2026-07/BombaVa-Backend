import { Match, sequelize, ShipInstance, ShipTemplate, User, UserShip } from '../../../src/shared/models/index.js';

describe('Ship Instance Persistence (Integration)', () => {
    beforeAll(async () => {
        await sequelize.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
        await sequelize.sync({ force: true });
        await ShipTemplate.create({ slug: 'lancha', name: 'Lancha Test', width: 1, height: 1, baseMaxHp: 10, supplyCost: 5 });
    });

    afterAll(async () => {
        await sequelize.close();
    });

    it('Debe crear una instancia de barco vinculada a un usuario y una partida', async () => {
        const user = await User.create({ username: 'cap', email: 'cap@test.com', password_hash: '123' });
        const match = await Match.create({ status: 'PLAYING', mapTerrain: { size: 15 } });

        const userShip = await UserShip.create({
            userId: user.id,
            templateSlug: 'lancha'
        });

        const shipInstance = await ShipInstance.create({
            matchId: match.id,
            playerId: user.id,
            userShipId: userShip.id,
            x: 7, y: 7, orientation: 'E', currentHp: 10
        });

        expect(shipInstance.id).toBeDefined();
    });
});