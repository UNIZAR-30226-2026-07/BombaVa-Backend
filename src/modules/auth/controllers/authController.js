/**
 * Controlador de Autenticación
 * Gestiona las peticiones HTTP de registro y login.
 */
import { validationResult } from 'express-validator';
import UserDao from '../dao/UserDao.js';
import * as authService from '../services/authService.js';

/**
 * Endpoint de registro de usuarios
 */
export const registerUser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const usuarioCreado = await authService.registrarNuevoUsuario(req.body);
    const token = authService.generarTokenAcceso(usuarioCreado);
    res.status(201).json({ token });
  } catch (error) {
    next(error);
  }
};

/**
 * Endpoint de inicio de sesión
 */
export const loginUser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, contrasena } = req.body;
    const usuario = await UserDao.findByMail(email);

    if (!usuario || !(await authService.verificarContrasena(contrasena, usuario.password_hash))) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const token = authService.generarTokenAcceso(usuario);
    res.json({
      id: usuario.id,
      username: usuario.username,
      email: usuario.email,
      elo: usuario.elo_rating,
      token
    });
  } catch (error) {
    next(error);
  }
};