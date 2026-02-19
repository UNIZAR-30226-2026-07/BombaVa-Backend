import { Match, Projectile, sequelize, ShipInstance, ShipTemplate, User, UserShip } from '../../../src/shared/models/index.js';

describe('Engine Entities Persistence (Integration)', () => {
    beforeAll(async () => {
        await sequelize.query('DROP SCHEMA public CASCADE;');
        await sequelize.query('CREATE SCHEMA public;');
        await sequelize.sync({ force: true });
    });

    afterAll(async () => {
        await sequelize.close();
    });

    it('Debe persistir barcos y proyectiles en una misma partida', async () => {
        const user = await User.create({ username: 'tactician', email: 't@b.va', password_hash: '1' });
        const template = await ShipTemplate.create({ slug: 'sub', name: 'Sub', width: 3, height: 1, baseMaxHp: 30, supplyCost: 10 });
        const userShip = await UserShip.create({ user_id: user.id, template_slug: template.slug });
        const match = await Match.create({ status: 'PLAYING', mapTerrain: {} });

        // Crear barco en el agua
        await ShipInstance.create({
            match_id: match.id,
            player_id: user.id,
            user_ship_id: userShip.id,
            x: 2, y: 2, orientation: 'N', currentHp: 30
        });

        // Crear torpedo disparado por el usuario
        await Projectile.create({
            match_id: match.id,
            owner_id: user.id,
            type: 'TORPEDO',
            x: 2, y: 3, vectorY: 1, lifeDistance: 4
        });

        const projectiles = await Projectile.findAll({ where: { match_id: match.id }, include: ['Owner'] });
        expect(projectiles).toHaveLength(1);
        expect(projectiles[0].Owner.username).toBe('tactician');
    });
});