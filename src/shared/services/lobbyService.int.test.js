/**
 * Test de Integración: LobbyService
 * Utiliza la Factoría de Datos para un setup limpio y rápido.
 */
import { sequelize } from '../../config/db.js';
import { Match } from '../../shared/models/index.js';
import { createFullUserContext } from '../../shared/models/testFactory.js';
import { crearLobby, ejecutarInicioPartida, intentarUnirseALobby } from './lobbyService.js';

describe('LobbyService Integration (Refactored)', () => {
    let hostCtx, guestCtx;

    beforeAll(async () => {
        await sequelize.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
        await sequelize.sync({ force: true });

        hostCtx = await createFullUserContext('hoster', 'h@t.com');
        guestCtx = await createFullUserContext('guesty', 'g@t.com');
    });

    afterAll(async () => {
        await sequelize.close();
    });

    it('Debe orquestar el inicio de partida correctamente tras completar el lobby', async () => {
        const codigo = crearLobby(hostCtx.user.id, 's1');
        const lobby = intentarUnirseALobby(codigo, guestCtx.user.id, 's2');

        const partida = await ejecutarInicioPartida(codigo, lobby);

        expect(partida.id).toBeDefined();
        const dbMatch = await Match.findByPk(partida.id);
        expect(dbMatch.status).toBe('PLAYING');
    });
});