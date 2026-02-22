/**
 * Configuración de Conexión a Base de Datos.
 * Inicializa la instancia para PostgreSQL con estándares de nomenclatura snake_case.
 */
import 'dotenv/config';
import Sequelize from 'sequelize';

export const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false,
    define: {
        timestamps: true,
        underscored: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

/**
 * Prueba la conexión con la base de datos.
 */
export const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('Conexión a PostgreSQL establecida correctamente.');
    } catch (error) {
        console.error('Error de conexión a DB:', error.message);
        process.exit(1);
    }
};