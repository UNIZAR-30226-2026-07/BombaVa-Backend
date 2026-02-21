import { initializeMatchPersistence } from '../../../src/modules/game/controllers/matchSetupController.js';
import { FleetDeck, sequelize, ShipInstance, ShipTemplate, User, UserShip } from '../../../src/shared/models/index.js';

describe('Match Setup Dynamic HP Tests', () => {
    beforeAll(async () => {
        await sequelize.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
        await sequelize.sync({ force: true });

        await ShipTemplate.create({ slug: 'acorazado', name: 'A', width: 1, height: 5, baseMaxHp: 50, supplyCost: 40 });
    });

    afterAll(async () => {
        await sequelize.close();
    });

    it('Debe inicializar un barco con el HP de su plantilla (50 para acorazado)', async () => {
        const user = await User.create({ username: 'hp_test', email: 'hp@test.com', password_hash: '1' });
        const uShip = await UserShip.create({ userId: user.id, templateSlug: 'acorazado' });

        await FleetDeck.create({
            userId: user.id,
            deckName: 'HP Deck',
            isActive: true,
            shipIds: [{ userShipId: uShip.id, position: { x: 0, y: 0 }, orientation: 'N' }]
        });

        const partida = await initializeMatchPersistence([{ id: user.id, socketId: 's1' }]);

        const instancia = await ShipInstance.findOne({ where: { matchId: partida.id, playerId: user.id } });
        expect(instancia.currentHp).toBe(50);
    });
});