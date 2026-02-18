import { DataTypes } from 'sequelize';
import { sequelize } from '../../../config/db.js';

const Projectile = sequelize.define('Projectile', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    type: {
        type: DataTypes.ENUM('TORPEDO', 'MINE'),
        allowNull: false,
        validate: {
            isIn: {
                args: [['TORPEDO', 'MINE']],
                msg: "El tipo de proyectil debe ser TORPEDO o MINE"
            }
        }
    },
    x: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: { min: 0, max: 14 } // OJO: Tablero 15x15
    },
    y: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: { min: 0, max: 14 } // OJO: Tablero 15x15
    },
    vectorX: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: { min: -1, max: 1 }
    },
    vectorY: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: { min: -1, max: 1 }
    },
    lifeDistance: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: { min: 0 }
    }
}, {
    tableName: 'projectiles',
    underscored: true
});

export default Projectile;