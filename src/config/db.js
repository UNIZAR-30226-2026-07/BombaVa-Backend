/**
 * Configuración de Conexión a Base de Datos.
 * Utiliza una lógica de fallback para detectar si el host es 'db' o 'localhost'.
 */
import 'dotenv/config';
import Sequelize from 'sequelize';

/**
 * Construye la URL de conexión. 
 * Prioriza DB_HOST si existe (útil para Docker), de lo contrario usa la URL de .env.
 */
const getDatabaseUrl = () => {
    const url = process.env.DATABASE_URL;
    if (process.env.DB_HOST) {
        return url.replace('localhost', process.env.DB_HOST).replace('db', process.env.DB_HOST);
    }
    return url;
};

const isProduction = process.env.NODE_ENV === 'production';

export const sequelize = new Sequelize(getDatabaseUrl(), {
    dialect: 'postgres',
    logging: false,
    dialectOptions: isProduction ? {
        ssl:{
            require: true,
            rejectUnauthorized: false // Esto es necesario en Render
        }
        
    } : {}, //Para local, no hacer nada
    define: {
        timestamps: true,
        underscored: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    },
    retry: {
        max: 3
    },
    
});

/**
 * Prueba la conexión con la base de datos.
 */
export const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('Conexión establecida con:', getDatabaseUrl());
    } catch (error) {
        console.error('Error de conexión a DB:', error.message);
        process.exit(1);
    }
};