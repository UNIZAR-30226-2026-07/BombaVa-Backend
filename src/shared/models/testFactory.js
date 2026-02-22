/**
 * Factoría de Datos para Tests de Integración
 * Centraliza la creación de entidades para mantener los tests limpios y desacoplados.
 */
import { FleetDeck, Match, MatchPlayer, ShipInstance, ShipTemplate, User, UserShip } from './index.js';

/**
 * Crea una plantilla de barco estandarizada para tests
 * @param {string} slug 
 * @param {Object} overrides 
 */
export const createTemplate = async (slug = 'lancha', overrides = {}) => {
    const [template] = await ShipTemplate.findOrCreate({
        where: { slug },
        defaults: {
            name: slug.charAt(0).toUpperCase() + slug.slice(1),
            width: 1,
            height: 1,
            baseMaxHp: 20,
            supplyCost: 10,
            baseStats: { speed: 5, vision: 5 },
            ...overrides
        }
    });
    return template;
};

/**
 * Crea un entorno completo de usuario con barco y mazo activo
 */
export const createFullUserContext = async (username, email) => {
    const [user] = await User.findOrCreate({
        where: { email },
        defaults: {
            username,
            password_hash: 'test_hash'
        }
    });

    const template = await createTemplate('lancha');

    const [uShip] = await UserShip.findOrCreate({
        where: { userId: user.id, templateSlug: template.slug },
        defaults: { level: 1 }
    });

    const [deck] = await FleetDeck.findOrCreate({
        where: { userId: user.id, deckName: 'Mazo Inicial' },
        defaults: {
            isActive: true,
            shipIds: [{ userShipId: uShip.id, position: { x: 0, y: 0 }, orientation: 'N' }]
        }
    });

    return { user, uShip, deck, template };
};

/**
 * Crea una partida activa con un jugador y un barco instanciado
 */
export const createMatchWithInstance = async (username, email, pos = { x: 5, y: 5 }) => {
    const ctx = await createFullUserContext(username, email);

    const match = await Match.create({
        status: 'PLAYING',
        mapTerrain: { size: 15 },
        turnNumber: 1
    });

    await MatchPlayer.create({
        matchId: match.id,
        userId: ctx.user.id,
        side: 'NORTH',
        fuelReserve: 20,
        ammoCurrent: 10
    });

    const instance = await ShipInstance.create({
        matchId: match.id,
        playerId: ctx.user.id,
        userShipId: ctx.uShip.id,
        x: pos.x,
        y: pos.y,
        orientation: 'N',
        currentHp: ctx.template.baseMaxHp
    });

    return { ...ctx, match, instance };
};

/**
 * Crea una partida completa con dos jugadores enfrentados y barcos instanciados
 */
export const createCompleteMatch = async (p1Data, p2Data) => {
    const host = await createFullUserContext(p1Data.username, p1Data.email);
    const guest = await createFullUserContext(p2Data.username, p2Data.email);

    const match = await Match.create({
        status: 'PLAYING',
        mapTerrain: { size: 15 },
        turnNumber: 1,
        currentTurnPlayerId: host.user.id
    });

    await MatchPlayer.create({
        matchId: match.id, userId: host.user.id, side: 'NORTH',
        fuelReserve: 10, ammoCurrent: 5
    });

    await MatchPlayer.create({
        matchId: match.id, userId: guest.user.id, side: 'SOUTH',
        fuelReserve: 10, ammoCurrent: 0
    });

    await ShipInstance.create({
        matchId: match.id, playerId: host.user.id, userShipId: host.uShip.id,
        x: 0, y: 0, orientation: 'N', currentHp: host.template.baseMaxHp
    });

    await ShipInstance.create({
        matchId: match.id, playerId: guest.user.id, userShipId: guest.uShip.id,
        x: 0, y: 14, orientation: 'S', currentHp: guest.template.baseMaxHp
    });

    return { match, host, guest };
};