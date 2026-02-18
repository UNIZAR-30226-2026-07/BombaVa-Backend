/**
 * Database Connection Configuration
 * Inicializa la instancia para PostgreSQL.
 */
import Sequelize from 'sequelize';
import 'dotenv/config'

export const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false,
    define: {
        timestamps: true,
        underscored: true
    }
});

/**
 * Prueba la conexión con la base de datos
 */
export const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('Conexión a PostgreSQL establecida correctamente.');
    } catch (error) {
        console.error('No se pudo conectar a la base de datos:', error.message);
        process.exit(1);
    }
};