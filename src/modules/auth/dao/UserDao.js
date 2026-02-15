

const { User } = require('../models/User')

class UserDao {
    
    /**
     * Método que devuelve una clase usuario por su nombre
     * @param {string} name - Nombre de un usuario que se quiere buscar
     * @returns Devuelve la información de un ususario si existe, o null si no existe
     */
    async findByName(name){
        try {
            const usuario = await User.findOne({
                where:{
                    username: name
                }
            });

            return usuario;
        } catch (error){
            console.error('Error al buscar usuario por nombre:', error);
            throw error;
        }
    }

    /**
     * Método que crea un usuario en la base de datos si es válido
     * @param {User} user - Objeto del tipo User con sus datos
     * @returns El propio Objeto
     */
    async createUser(user){
        try{
            const newUser = await User.create(user);
            return newUser;
        } catch (error){
            console.error('Error al crear un usuario:', error);
            throw error;
        }
    }
}

module.exports = new UserDao();