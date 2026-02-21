import bcrypt from 'bcrypt';
import { validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import UserDao from '../dao/UserDao.js';

/**
 * Función que genera el token de sesión para un usuario
 * @param {string} nombreUsuario 
 * @param {string} email 
 * @returns Devuelve el token de sesión para el usuario
 */
export const generateToken = (nombreUsuario, email) => {
  const payload = { nombreUsuario, email };
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '24h',
  });
};

/**
 * Registra un nuevo usuario, cifra su contraseña y genera un token de acceso
 * @param {Object} req - Petición con username, email y contrasena
 * @param {Object} res - Respuesta con el token generado
 * @param {Function} next - Middleware de error
 */
export const registerUser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { username, email, contrasena } = req.body;

    const salt = await bcrypt.genSalt(10);
    const hashContrasena = await bcrypt.hash(contrasena, salt);

    const nuevoUser = {
      username,
      email,
      password_hash: hashContrasena
    };

    const userCreado = await UserDao.createUser(nuevoUser);
    const token = generateToken(userCreado.username, userCreado.email);

    res.status(201).json({ token });
  } catch (error) {
    next(error);
  }
}

/**
 * Controlador que autentica a un usuario y devuelve un token
 * @param {object} req - Objeto de petición de Express
 * @param {object} res - Objeto de respuesta de Express
 * @param {function} next - Función para pasar al siguiente middleware
 */
export const loginUser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, contrasena } = req.body;
    const usuario = await UserDao.findByMail(email);

    if (usuario && (await bcrypt.compare(contrasena, usuario.password_hash))) {
      const token = generateToken(usuario.username, usuario.email);

      res.json({
        id: usuario.id,
        username: usuario.username,
        email: usuario.email,
        elo: usuario.elo_rating,
        token: token
      });
    } else {
      res.status(401).json({ message: 'Credenciales inválidas' });
    }
  } catch (error) {
    next(error);
  }
};