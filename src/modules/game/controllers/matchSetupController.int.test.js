/**
 * Test de Integración: Inicialización de Partida (API Interna)
 * Verifica que el Setup cree correctamente los barcos en sus posiciones reales de combate.
 */
import { sequelize } from '../../../config/db.js';
import { FleetDeck, ShipInstance, ShipTemplate, User, UserShip } from '../../../shared/models/index.js';
import { initializeMatchPersistence } from './matchSetupController.js';

describe('MatchSetupController Integration', () => {
    let host, guest, shipHost, shipGuest;

    beforeAll(async () => {
        await sequelize.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
        await sequelize.sync({ force: true });

        await ShipTemplate.create({ slug: 'lancha', name: 'Lancha', baseMaxHp: 10, supplyCost: 5 });
        host = await User.create({ username: 'host_player', email: 'h@t.com', password_hash: '1' });
        guest = await User.create({ username: 'guest_player', email: 'g@t.com', password_hash: '1' });

        shipHost = await UserShip.create({ userId: host.id, templateSlug: 'lancha' });
        shipGuest = await UserShip.create({ userId: guest.id, templateSlug: 'lancha' });

        await FleetDeck.create({
            userId: host.id, deckName: 'Mazo del Host', isActive: true,
            shipIds: [{ userShipId: shipHost.id, position: { x: 5, y: 0 }, orientation: 'N' }]
        });

        await FleetDeck.create({
            userId: guest.id, deckName: 'Mazo del Guest', isActive: true,
            shipIds: [{ userShipId: shipGuest.id, position: { x: 5, y: 0 }, orientation: 'N' }]
        });
    });

    afterAll(async () => {
        await sequelize.close();
    });

    it('Debe crear la partida y traducir las posiciones del jugador SUR (14 - Y)', async () => {
        const match = await initializeMatchPersistence([
            { id: host.id, socketId: 's1' },
            { id: guest.id, socketId: 's2' }
        ]);

        expect(match.id).toBeDefined();

        const instHost = await ShipInstance.findOne({ where: { matchId: match.id, playerId: host.id } });
        expect(instHost.y).toBe(0);

        const instGuest = await ShipInstance.findOne({ where: { matchId: match.id, playerId: guest.id } });
        expect(instGuest.y).toBe(14);
    });
});