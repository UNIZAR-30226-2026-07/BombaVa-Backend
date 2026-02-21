import { Match, Projectile, sequelize, ShipInstance, ShipTemplate, User, UserShip } from '../../../src/shared/models/index.js';

/**
 * Pruebas de integración para las entidades del motor de juego
 */
describe('Engine Entities Persistence (Integration)', () => {
    beforeAll(async () => {
        await sequelize.query('DROP SCHEMA public CASCADE;');
        await sequelize.query('CREATE SCHEMA public;');
        await sequelize.sync({ force: true });
    });

    afterAll(async () => {
        await sequelize.close();
    });

    /**
     * Valida que se puedan persistir instancias de barcos y proyectiles relacionados
     */
    it('Debe persistir barcos y proyectiles en una misma partida', async () => {
        const user = await User.create({
            username: 'tactician',
            email: 't@b.va',
            password_hash: '1'
        });

        const template = await ShipTemplate.create({
            slug: 'sub',
            name: 'Sub',
            width: 3,
            height: 1,
            baseMaxHp: 30,
            supplyCost: 10
        });

        const userShip = await UserShip.create({
            userId: user.id,
            templateSlug: template.slug
        });

        const match = await Match.create({
            status: 'PLAYING',
            mapTerrain: { size: 15 }
        });

        await ShipInstance.create({
            matchId: match.id,
            playerId: user.id,
            userShipId: userShip.id,
            x: 2,
            y: 2,
            orientation: 'N',
            currentHp: 30
        });

        await Projectile.create({
            matchId: match.id,
            ownerId: user.id,
            type: 'TORPEDO',
            x: 2, y: 3, vectorY: 1, lifeDistance: 4
        });

        const projectiles = await Projectile.findAll({
            where: { matchId: match.id },
            include: ['Owner']
        });

        expect(projectiles).toHaveLength(1);
        expect(projectiles[0].Owner.username).toBe('tactician');
    });
});