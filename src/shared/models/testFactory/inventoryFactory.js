/**
 * Factoría de Inventario para pruebas.
 */
import { FleetDeck, ShipTemplate, UserShip } from '../index.js';
import { createUser } from './authFactory.js';

/**
 * Crea o recupera una plantilla de barco.
 */
export const createTemplate = async (slug = 'lancha', overrides = {}) => {
    const [template] = await ShipTemplate.findOrCreate({
        where: { slug },
        defaults: {
            name: slug.charAt(0).toUpperCase() + slug.slice(1),
            width: 1, height: 1, baseMaxHp: 20, supplyCost: 10,
            baseStats: { speed: 5, vision: 5 },
            ...overrides
        }
    });
    return template;
};

/**
 * Crea un contexto de inventario (Barco + Mazo) para un usuario existente.
 */
export const createFullInventoryContext = async (user) => {
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

    return { uShip, deck, template };
};

/**
 * Orquestador: Crea usuario + inventario completo.
 * Requerido por la mayoría de tests de integración.
 */
export const createFullUserContext = async (username, email) => {
    const user = await createUser(username, email);
    const inventory = await createFullInventoryContext(user);
    return { user, ...inventory };
};