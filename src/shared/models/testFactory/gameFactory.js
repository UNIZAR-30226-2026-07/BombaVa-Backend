/**
 * Factoría de Juego para pruebas.
 */
import { Match, MatchPlayer, ShipInstance } from '../index.js';
import { createUser } from './authFactory.js';
import { createFullInventoryContext } from './inventoryFactory.js';

/**
 * Crea una partida completa con atacante y víctima en posiciones de tiro (distancia 2).
 */
export const createCompleteMatch = async (p1Data, p2Data) => {
    const hostUser = await createUser(p1Data.username, p1Data.email);
    const guestUser = await createUser(p2Data.username, p2Data.email);

    const hostInv = await createFullInventoryContext(hostUser);
    const guestInv = await createFullInventoryContext(guestUser);

    const match = await Match.create({
        status: 'PLAYING',
        mapTerrain: { size: 15 },
        turnNumber: 1,
        currentTurnPlayerId: hostUser.id
    });

    await MatchPlayer.create({
        matchId: match.id, userId: hostUser.id, side: 'NORTH', fuelReserve: 30, ammoCurrent: 10
    });

    await MatchPlayer.create({
        matchId: match.id, userId: guestUser.id, side: 'SOUTH', fuelReserve: 30, ammoCurrent: 10
    });

    const shipH = await ShipInstance.create({
        matchId: match.id, playerId: hostUser.id, userShipId: hostInv.uShip.id,
        x: 5, y: 5, orientation: 'N', currentHp: hostInv.template.baseMaxHp
    });

    const shipG = await ShipInstance.create({
        matchId: match.id, playerId: guestUser.id, userShipId: guestInv.uShip.id,
        x: 5, y: 7, orientation: 'S', currentHp: guestInv.template.baseMaxHp
    });

    return { match, host: { user: hostUser, ...hostInv }, guest: { user: guestUser, ...guestInv }, shipH, shipG };
};

/**
 * Crea una partida con una sola instancia para tests de movimiento.
 */
export const createMatchWithInstance = async (username, email, pos = { x: 5, y: 5 }) => {
    const user = await createUser(username, email);
    const inv = await createFullInventoryContext(user);

    const match = await Match.create({
        status: 'PLAYING', mapTerrain: { size: 15 }, turnNumber: 1
    });

    await MatchPlayer.create({
        matchId: match.id, userId: user.id, side: 'NORTH', fuelReserve: 30, ammoCurrent: 10
    });

    const instance = await ShipInstance.create({
        matchId: match.id, playerId: user.id, userShipId: inv.uShip.id,
        x: pos.x, y: pos.y, orientation: 'N', currentHp: inv.template.baseMaxHp
    });

    return { user, ...inv, match, instance };
};