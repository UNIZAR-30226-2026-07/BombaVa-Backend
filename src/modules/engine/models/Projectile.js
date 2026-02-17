/**
 * Projectile Model
 * Entidades no-instantaneas presentes en el tablero
 */
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
        allowNull: false
    },
    x: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    y: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    vectorX: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    vectorY: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    lifeDistance: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'projectiles',
    underscored: true
});

export default Projectile;