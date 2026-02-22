/**
 * Test de Integración: Flujo de Lobby a Partida
 * Valida que los lobbies en memoria terminen creando partidas reales en la base de datos.
 */
import { sequelize } from '../../config/db.js';
import { FleetDeck, Match, ShipTemplate, User, UserShip } from '../../shared/models/index.js';
import { crearLobby, ejecutarInicioPartida, intentarUnirseALobby } from './lobbyService.js';

describe('LobbyService Integration (Memory to DB Flow)', () => {
    let u1, u2;

    beforeAll(async () => {
        await sequelize.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
        await sequelize.sync({ force: true });
        await ShipTemplate.create({ slug: 'lancha', name: 'Lancha', baseMaxHp: 10, supplyCost: 5 });
        u1 = await User.create({ username: 'hoster', email: 'h@t.com', password_hash: '1' });
        u2 = await User.create({ username: 'guesty', email: 'g@t.com', password_hash: '1' });

        const s1 = await UserShip.create({ userId: u1.id, templateSlug: 'lancha' });
        const s2 = await UserShip.create({ userId: u2.id, templateSlug: 'lancha' });

        await FleetDeck.create({
            userId: u1.id, deckName: 'Mazo Host', isActive: true,
            shipIds: [{ userShipId: s1.id, position: { x: 0, y: 0 }, orientation: 'N' }]
        });
        await FleetDeck.create({
            userId: u2.id, deckName: 'Mazo Guest', isActive: true,
            shipIds: [{ userShipId: s2.id, position: { x: 0, y: 0 }, orientation: 'N' }]
        });
    });

    afterAll(async () => {
        await sequelize.close();
    });

    it('Debe completar el ciclo de vida: Crear -> Unir -> Persistir Partida', async () => {
        const codigo = crearLobby(u1.id, 'socket-1');
        expect(codigo).toHaveLength(6);

        const lobby = intentarUnirseALobby(codigo, u2.id, 'socket-2');
        expect(lobby).toHaveLength(2);

        const partida = await ejecutarInicioPartida(codigo, lobby);

        expect(partida.id).toBeDefined();
        const partidaEnDb = await Match.findByPk(partida.id);
        expect(partidaEnDb.status).toBe('PLAYING');
    });
});