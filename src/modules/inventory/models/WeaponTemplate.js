// Plantillas de armamento para los barcos 
//
import { DataTypes } from 'sequelize';
import { sequelize } from '../../../config/db.js';

const WeaponTemplate = sequelize.define('WeaponTemplate', {
    slug: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    type: {
        type: DataTypes.ENUM('CANNON', 'TORPEDO', 'MINE'),
        allowNull: false
    },
    damage: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: { min: 0 }
    },
    apCost: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'ap_cost',
        validate: { min: 0 }
    },
    range: {
        type: DataTypes.INTEGER,
        allowNull: true, // Null para minas que se ponen adyacentes o torpedos
        defaultValue: 0
    },
    lifeDistance: {
        type: DataTypes.INTEGER,
        allowNull: true, // Solo para torpedos (recorrido) y minas (turnos)
        field: 'life_distance',
        defaultValue: 0
    }
}, {
    tableName: 'weapon_templates',
    underscored: true,
    timestamps: false
});

export default WeaponTemplate;
