/**
 * Test de Integración: ProjectileDao
 * Verifica la correcta persistencia de proyectiles en la base de datos.
 */
import { sequelize } from '../../../config/db.js';
import ProjectileDao from './ProjectileDao.js';
import { Projectile, Match, User } from '../../../shared/models/index.js';

describe('DAO: ProjectileDao', () => {
    let testMatch;
    let testUser;

    beforeAll(async () => {
        await sequelize.sync({ force: true });
        testUser = await User.create({
            username: 'tester', email: 'test@dao.com', password_hash: 'hash'
        });
        testMatch = await Match.create({
            status: 'PLAYING', mapTerrain: {}, turnNumber: 1, currentTurnPlayerId: testUser.id
        });
    });

    afterAll(async () => {
        await sequelize.close();
    });

    it('Debe crear un proyectil correctamente en la base de datos', async () => {
        const projectileData = {
            matchId: testMatch.id,
            ownerId: testUser.id,
            type: 'TORPEDO',
            x: 5,
            y: 5,
            vectorX: 0,
            vectorY: 1,
            lifeDistance: 10
        };

        const createdProjectile = await ProjectileDao.createProjectile(projectileData);

        expect(createdProjectile).toBeDefined();
        expect(createdProjectile.id).toBeDefined();
        expect(createdProjectile.type).toBe('TORPEDO');
        expect(createdProjectile.matchId).toBe(testMatch.id);
        expect(createdProjectile.x).toBe(5);
        const foundInDb = await Projectile.findByPk(createdProjectile.id);
        expect(foundInDb).not.toBeNull();
        expect(foundInDb.lifeDistance).toBe(10);
    });
});