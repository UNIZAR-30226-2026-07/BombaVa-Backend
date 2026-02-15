
const { validationResult } = require('express-validator')
const {bcrypt} = require ('bcrypt')
const {jwt} = require ('jsonwebtoken')


/**
 * Función que genera el token de sesión para un usuario
 * @param {string} nombreUsuario 
 * @param {string} email 
 * @returns Devuelve el token de sesión para el usuario y su correo
 */
export const generateToken = (nombreUsuario, email) => {
  const payload = { 
    nombreUsuario, 
    email
  };
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '24h', //Este valor se puede modificar mas adelante
  });
};

