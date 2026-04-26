/**
 * Función que genera todo los datos por defecto que debe tener la BBDD
 */
import { ShipTemplate, WeaponTemplate, User, UserShip, FleetDeck } from './index.js';
import { authService } from '../../modules/auth/index.js';
import crypto from 'crypto';

export const BOT_UUID = 'ffffffff-ffff-ffff-ffff-ffffffffffff';

const templatesData = [
    {
        slug: 'lancha',
        name: 'Lancha',
        width: 1, height: 1,
        baseMaxHp: 20,
        supplyCost: 10,
        visionRange: 4
    },
    {
        slug: 'fragata',
        name: 'Fragata',
        width: 1, height: 3,
        baseMaxHp: 30,
        supplyCost: 15,
        visionRange: 3
    },
    {
        slug: 'acorazado',
        name: 'Acorazado',
        width: 1, height: 5,
        baseMaxHp: 50,
        supplyCost: 40,
        visionRange: 2
    }
];

const weaponsData = [
    {
        slug: 'cannon-base',
        name: 'Cañón Estándar',
        description: 'Arma de fuego directo.',
        type: 'CANNON',
        damage: 10,
        apCost: 2,
        range: 4
    },
    {
        slug: 'torpedo-v1',
        name: 'Lanzatorpedos',
        description: 'Lanza proyectiles lentos que se desplazan por el tablero.',
        type: 'TORPEDO',
        damage: 20,
        apCost: 3,
        lifeDistance: 6
    },
    {
        slug: 'mine-v1',
        name: 'Desplegador de Minas',
        description: 'Coloca minas estáticas en el agua.',
        type: 'MINE',
        damage: 25,
        apCost: 2,
        lifeDistance: 10
    }
];


/**
 * Genera el perfil y el mazo por defecto de la IA.
 */
const initAIBot = async () => {

    const botRawPassword = process.env.BOT_PASSWORD || crypto.randomBytes(32).toString('hex');
    const botHash = await authService.cifrarContrasena(botRawPassword);

    // Crear el usuario Bot
    const [botUser] = await User.findOrCreate({
        where: { id: BOT_UUID },
        defaults: {
            username: 'Comandante_IA',
            email: 'bot@bombava.ia',
            password_hash: botHash,
            elo_rating: 1500 // Un elo base decente
        }
    });

    // Crear sus 3 barcos si no existen
    const [lancha] = await UserShip.findOrCreate({ where: { userId: botUser.id, templateSlug: 'lancha' }});
    const [fragata] = await UserShip.findOrCreate({ where: { userId: botUser.id, templateSlug: 'fragata' }});
    const [acorazado] = await UserShip.findOrCreate({ where: { userId: botUser.id, templateSlug: 'acorazado' }});

    // Equiparles todas las armas (para que la IA pueda elegir en combate)
    const allWeapons = await WeaponTemplate.findAll();
    await lancha.setWeaponTemplates(allWeapons);
    await fragata.setWeaponTemplates(allWeapons);
    await acorazado.setWeaponTemplates(allWeapons);

    // onfigurar su formación
    // El bot asume que juega en el Norte, apuntando al Sur.
    await FleetDeck.findOrCreate({
        where: { userId: botUser.id, deckName: 'Formación Táctica Alpha' },
        defaults: {
            isActive: true,
            shipIds: [
                { userShipId: lancha.id, position: { x: 7, y: 3 }, orientation: 'N' }, 
                { userShipId: fragata.id, position: { x: 3, y: 1 }, orientation: 'N' },
                { userShipId: acorazado.id, position: { x: 11, y: 1 }, orientation: 'N' } 
            ]
        }
    });
};

/**
 * Garantiza que los elementos esenciales del juego existan.
 * @throws {Error} Si ocurre una violación de integridad o error de base de datos.
 */
export const initDefaults = async () => {
    try {
        for (const t of templatesData) {
            await ShipTemplate.findOrCreate({ where: { slug: t.slug }, defaults: t });
        }
        for (const w of weaponsData) {
            await WeaponTemplate.findOrCreate({ where: { slug: w.slug }, defaults: w });
        }
        
        await initAIBot();
        
    } catch (error) {
        console.error("Error al inicializar datos por defecto:", error);
        throw error;
    }
};
