/**
 * Semilla de Base de Datos (Seeder).
 * Puebla la base de datos con valores iniciales para desarrollo.
 * Lanza excepciones para permitir que el CI/CD detecte fallos de integridad.
 */
import { authService } from '../../modules/auth/index.js';
import { FleetDeck, ShipTemplate, User, UserShip } from './index.js';

/**
 * Ejecuta el proceso de seeding inicial.
 * @throws {Error} Si ocurre una violación de integridad o error de base de datos.
 */
const runSeeder = async () => {
    try {
        console.log('Poblando la Base de Datos de desarrollo...');

        const hashedPass = await authService.cifrarContrasena('admin123');

        const [raul] = await User.findOrCreate({
            where: { email: 'raul@unizar.es' },
            defaults: {
                username: 'raul_lead',
                password_hash: hashedPass,
                elo_rating: 1200
            }
        });

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
        console.error('Error crítico en el Seeding:', error.message);
        throw error;
    }
};

export default runSeeder;