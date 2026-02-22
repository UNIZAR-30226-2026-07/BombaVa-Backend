/**
 * Data Access Object para Usuarios
 * Encapsula todas las consultas directas a la base de datos para la entidad User.
 */
import User from '../models/User.js';

class UserDao {
    /**
     * Busca un usuario por su nombre de usuario único
     * @param {string} username - Nombre a buscar
     */
    async findByName(username) {
        return await User.findOne({
            where: { username }
        });
    }

    /**
     * Busca un usuario por su correo electrónico único
     * @param {string} email - Correo a buscar
     */
    async findByMail(email) {
        return await User.findOne({
            where: { email }
        });
    }

    /**
     * Crea una nueva entrada de usuario en la base de datos
     * @param {Object} userData - Datos validados del usuario
     */
    async createUser(userData) {
        return await User.create(userData);
    }

    /**
     * Busca un usuario por su clave primaria (UUID)
     * @param {string} id - UUID del usuario
     */
    async findById(id) {
        return await User.findByPk(id);
    }
}

export default new UserDao();