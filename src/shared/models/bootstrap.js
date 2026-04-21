/**
 * Función que genera todo los datos por defecto que debe tener la BBDD
 */
import { ShipTemplate, WeaponTemplate } from './index.js';

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
 * Garantiza que los elementos esenciales del juego existan.
 * @throws {Error} Si ocurre una violación de integridad o error de base de datos.
 */
export const initDefaults = async () => {
    try {
        for (const t of templatesData) {
            await ShipTemplate.findOrCreate({
                where: { slug: t.slug },
                defaults: t
            });
        }
        for (const w of weaponsData) {
            await WeaponTemplate.findOrCreate({
                where: { slug: w.slug },
                defaults: w
            });
        }
    } catch (error) {
        throw error;
    }
};
