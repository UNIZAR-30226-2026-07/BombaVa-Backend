/**
 * Función que genera todo los datos por defecto que debe tener la BBDD
 */
import { ShipTemplate } from './index.js';

const templatesData = [
    {
        slug: 'lancha',
        name: 'Lancha',
        width: 1, height: 1,
        baseMaxHp: 20,
        supplyCost: 10,
        baseStats: { speed: 5, vision: 4 }
    },
    {
        slug: 'fragata',
        name: 'Fragata',
        width: 1, height: 3,
        baseMaxHp: 30,
        supplyCost: 15,
        baseStats: { speed: 3, vision: 3 }
    },
    {
        slug: 'acorazado',
        name: 'Acorazado',
        width: 1, height: 5,
        baseMaxHp: 50,
        supplyCost: 40,
        baseStats: { speed: 1, vision: 2 }
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
        console.log('Estructuras base del juego verificadas/creadas.');
    } catch (error) {
        console.error('Error inicializando datos base:', error);
        throw error;
    }
};
