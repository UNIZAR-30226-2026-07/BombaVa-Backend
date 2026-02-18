import { Match, sequelize, ShipInstance, ShipTemplate, User, UserShip } from '../../../src/shared/models/index.js';

describe('Ship Instance Persistence (Integration)', () => {

    beforeAll(async () => {
        await sequelize.query('DROP SCHEMA public CASCADE;');
        await sequelize.query('CREATE SCHEMA public;');
        await sequelize.sync({ force: true });

        await ShipTemplate.create({
            slug: 'lancha',
            name: 'Lancha Test',
            width: 1,
            height: 1,
            baseMaxHp: 10,
            supplyCost: 5
        });
    });

    afterAll(async () => {
        await sequelize.close();
    });

    it('Debe crear una instancia de barco vinculada a un usuario y una partida', async () => {
        const user = await User.create({
            username: 'captain_test',
            email: 'captain@test.com',
            password_hash: '123'
        });

        const match = await Match.create({
            status: 'PLAYING',
            mapTerrain: { size: 15, obstacles: [] }
        });

        const userShip = await UserShip.create({
            user_id: user.id,
            template_slug: 'lancha'
        });

        const shipInstance = await ShipInstance.create({
            match_id: match.id,
            player_id: user.id,
            user_ship_id: userShip.id,
            x: 7,
            y: 7,
            orientation: 'E',
            currentHp: 10
        });

        const savedShip = await ShipInstance.findByPk(shipInstance.id);
        expect(savedShip).not.toBeNull();
        expect(savedShip.x).toBe(7);
        expect(savedShip.orientation).toBe('E');
        expect(savedShip.player_id).toBe(user.id);
    });
});