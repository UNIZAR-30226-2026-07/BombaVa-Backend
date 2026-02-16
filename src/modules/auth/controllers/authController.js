import { validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import UserDao from '../dao/UserDao.js';
import User from '../models/User.js';

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

/**
 * Controlador que registra un usuario
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
export const registerUser = async (req, res, next) => {
  //Comprueba si hay errores de validación
  const errors = validationResult(req);
  if (!errors.isEmpty()){
    // Si hay errores, devuelve un 400 con la lista de errores
    return res.status(400).json({ errors: errors.array() });
  }
  try{
    const {username, email, contrasena} = req.body;
    
    const userExiste = await UserDao.findByName(username);
    if (userExiste){
      res.status(400);
      throw new Error('El nombre de usuario ya esta en uso');
    }
    console.log("Datos recibidos del body:", req.body);
    const salt = await bcrypt.genSalt(10);
    const hashContrasena = await bcrypt.hash(contrasena, salt);
    console.log(username);
    const nuevoUser ={
    username: username,
    email: email,
    password_hash: hashContrasena
};
    console.log(nuevoUser);
    const userCreado = await UserDao.createUser(nuevoUser);
    const token = generateToken(userCreado.username, userCreado.email);
    res.status(201).json({ token });
  } catch (error){
    //TODO: Hacer un controlador de errores
    //console.log("error al registra usuario:", error);
    next(error);
  }
}