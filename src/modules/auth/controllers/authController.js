import { validationResult } from 'express-validator';
import UserDao from '../dao/UserDao.js';
import * as authService from '../services/authService.js';

/**
 * Registro de usuario
 */
export const registerUser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const usuarioCreado = await authService.registrarNuevoUsuario(req.body);
    const token = authService.generarTokenAcceso(usuarioCreado);
    res.status(201).json({ token });
  } catch (error) {
    next(error);
  }
};

/**
 * Login de usuario
 */
export const loginUser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { email, contrasena } = req.body;
    const usuario = await UserDao.findByMail(email);

    if (usuario && await authService.verificarContrasena(contrasena, usuario.password_hash)) {
      const token = authService.generarTokenAcceso(usuario);
      return res.json({
        id: usuario.id,
        username: usuario.username,
        email: usuario.email,
        elo: usuario.elo_rating,
        token
      });
    }
    res.status(401).json({ message: 'Credenciales inválidas' });
  } catch (error) {
    next(error);
  }
};