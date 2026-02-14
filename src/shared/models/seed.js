/**
 * Database Seeder
 * Poblar la base de datos con valores (testing)
 */
const { sequelize, User, ShipTemplate, UserShip, FleetDeck } = require('./index');

const runSeeder = async () => {
    try {
        console.log('Poblando la Base de Datos...');

        // Plantillas de Barcos
        const templates = await ShipTemplate.bulkCreate([
            {
                slug: 'lancha',
                name: 'Lancha',
                width: 1, height: 1,
                baseMaxHp: 20,
                supplyCost: 10,
                baseStats: { speed: 5, vision: 5 }
            },
            {
                slug: 'submarino',
                name: 'Submarino',
                width: 3, height: 1,
                baseMaxHp: 40,
                supplyCost: 25,
                baseStats: { speed: 2, vision: 3, stealth: true }
            },
            {
                slug: 'acorazado',
                name: 'Acorazado',
                width: 4, height: 1,
                baseMaxHp: 100,
                supplyCost: 40,
                baseStats: { speed: 1, vision: 4, armor: 10 }
            }
        ], { ignoreDuplicates: true });

        // Crear Usuarios de Prueba
        const raul = await User.create({
            username: 'raul_lead',
            email: 'raul@unizar.es',
            password_hash: 'admin123', // en el futuro se encriptara (seguramente Bcrypt)
            elo_rating: 1500
        }).catch(() => null);

        const diego = await User.create({
            username: 'diego_dev',
            email: 'diego@unizar.es',
            password_hash: 'admin123',
            elo_rating: 1400
        }).catch(() => null);

        if (raul && templates.length > 0) {
            // crear deck
            const userShip = await UserShip.create({
                user_id: raul.id,
                template_slug: 'lancha',
                level: 1,
                customStats: { engine: 'V8' }
            });

            await FleetDeck.create({
                user_id: raul.id,
                deckName: 'Mazo Inicial',
                shipIds: [userShip.id],
                isActive: true
            });
        }

        console.log('Seeding completado con éxito.');
    } catch (error) {
        console.error('Error durante el Seeding:', error);
    }
};

module.exports = runSeeder;