import User from '../models/User.js';

class UserDao {

    /**
     * Método que devuelve una clase usuario por su nombre
     * @param {string} name - Nombre de un usuario que se quiere buscar
     * @returns Devuelve la información de un usuario si existe, o null si no existe
     */
    async findByName(name) {
        try {
            return await User.findOne({
                where: { username: name }
            });
        } catch (error) {
            throw error;
        }
    }

    /**
     * Método que crea un usuario en la base de datos si es válido
     * @param {Object} user - Datos del usuario
     * @returns El usuario creado
     */
    async createUser(user) {
        try {
            return await User.create(user);
        } catch (error) {
            throw error;
        }
    }
}

export default new UserDao();