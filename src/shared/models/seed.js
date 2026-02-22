/**
 * Semilla de Base de Datos
 * Puebla la base de datos con valores iniciales para el entorno de desarrollo
 * Garantiza la idempotencia utilizando nombres de atributos de modelo
 */
import { authService } from '../../modules/auth/index.js';
import { FleetDeck, ShipTemplate, User, UserShip } from './index.js';

/**
 * Ejecuta el proceso de seeding inicial.
 */
const runSeeder = async () => {
    try {
        console.log('Poblando la Base de Datos de desarrollo...');

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

        for (const t of templatesData) {
            await ShipTemplate.findOrCreate({
                where: { slug: t.slug },
                defaults: t
            });
        }

        const hashedPass = await authService.cifrarContrasena('admin123');

        const [raul, createdUser] = await User.findOrCreate({
            where: { email: 'raul@unizar.es' },
            defaults: {
                username: 'raul_lead',
                password_hash: hashedPass,
                elo_rating: 1200
            }
        });

        if (createdUser) {
            console.log('Usuario de prueba "raul_lead" creado.');
        }

        const [uShip] = await UserShip.findOrCreate({
            where: {
                userId: raul.id,
                templateSlug: 'lancha'
            },
            defaults: {
                level: 1,
                customStats: { engine: 'V8-Turbo', equippedWeapon: 'cannon-base' }
            }
        });

        await FleetDeck.findOrCreate({
            where: {
                userId: raul.id,
                deckName: 'Mazo Inicial'
            },
            defaults: {
                isActive: true,
                shipIds: [
                    {
                        userShipId: uShip.id,
                        position: { x: 5, y: 0 },
                        orientation: 'N'
                    }
                ]
            }
        });

        console.log('Seeding completado con éxito.');
    } catch (error) {
        console.error('Error durante el Seeding:', error.message);
    }
};

export default runSeeder;