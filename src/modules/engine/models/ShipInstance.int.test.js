/**
 * Test de Integración: Persistencia de Instancias de Barco
 * Valida la creación física de barcos en el tablero de una partida.
 */
import { sequelize } from '../../../config/db.js';
import { Match, ShipInstance, ShipTemplate, User, UserShip } from '../../../shared/models/index.js';

describe('ShipInstance Persistence Integration (Colocated)', () => {
    beforeAll(async () => {
        await sequelize.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
        await sequelize.sync({ force: true });

        // Setup necesario para la integridad referencial
        await ShipTemplate.create({ slug: 'lancha', name: 'Lancha', width: 1, height: 1, baseMaxHp: 10, supplyCost: 5 });
    });

    afterAll(async () => {
        await sequelize.close();
    });

    it('Debe crear una instancia de barco vinculada a usuario, partida y mazo', async () => {
        const user = await User.create({ username: 'capitan', email: 'cap@test.com', password_hash: '1' });
        const match = await Match.create({ status: 'PLAYING', mapTerrain: { size: 15 } });
        const uShip = await UserShip.create({ userId: user.id, templateSlug: 'lancha' });

        const ship = await ShipInstance.create({
            matchId: match.id,
            playerId: user.id,
            userShipId: uShip.id,
            x: 7, y: 7,
            orientation: 'E',
            currentHp: 10
        });

        expect(ship.id).toBeDefined();
        const saved = await ShipInstance.findByPk(ship.id);
        expect(saved.orientation).toBe('E');
        expect(saved.playerId).toBe(user.id);
    });
});