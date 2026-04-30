/**
 * Factoría de Inventario para pruebas.
 */
import FleetDeck from '../../../modules/inventory/models/FleetDeck.js';
import ShipTemplate from '../../../modules/inventory/models/ShipTemplate.js';
import UserShip from '../../../modules/inventory/models/UserShip.js';
import WeaponTemplate from '../../../modules/inventory/models/WeaponTemplate.js'
import { createUser } from './authFactory.js';
import { initDefaults } from '../bootstrap.js';

export const createDefaultWeapons = async () => {
    const [cannon] = await WeaponTemplate.findOrCreate({
        where: { slug: 'test-cannon' },
        defaults: { name: 'Cañón de Prueba', type: 'CANNON', damage: 10, apCost: 2, range: 4, lifeDistance: 0 }
    });

    const [mine] = await WeaponTemplate.findOrCreate({
        where: { slug: 'test-mine' },
        defaults: { name: 'Mina de Prueba', type: 'MINE', damage: 15, apCost: 3, range: 0, lifeDistance: 5 }
    });

    const [torpedo] = await WeaponTemplate.findOrCreate({
        where: { slug: 'test-torpedo' },
        defaults: { name: 'Torpedo de Prueba', type: 'TORPEDO', damage: 20, apCost: 4, range: 0, lifeDistance: 10 }
    });

    return [cannon, mine, torpedo];
};

/**
 * Crea o recupera una plantilla de barco.
 */
export const createTemplate = async (slug = 'lancha', overrides = {}) => {
    const [template] = await ShipTemplate.findOrCreate({
        where: { slug },
        defaults: {
            name: slug.charAt(0).toUpperCase() + slug.slice(1),
            width: 1, height: 1, baseMaxHp: 20, supplyCost: 10,
            visionRange: 5,
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

    const weapons = await createDefaultWeapons();
    await uShip.addWeaponTemplates(weapons);
    
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
 */
export const createFullUserContext = async (username, email) => {
    await initDefaults();
    const user = await createUser(username, email);
    const inventory = await createFullInventoryContext(user);
    return { user, ...inventory };
};