/**
 * Controlador de Autenticación
 * Gestiona las peticiones HTTP de registro y login.
 */
import { validationResult } from 'express-validator';
import UserDao from '../dao/UserDao.js';
import * as authService from '../services/authService.js';
import InventoryDao from '../../inventory/dao/InventoryDao.js';

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
    const barco1 = await InventoryDao.associateShip(usuarioCreado.id, 'lancha');
    const barco2 = await InventoryDao.associateShip(usuarioCreado.id, 'fragata');
    const barco3 = await InventoryDao.associateShip(usuarioCreado.id, 'acorazado');
    await InventoryDao.addWeaponToShip(barco1, 'cannon-base');
    await InventoryDao.addWeaponToShip(barco2, 'cannon-base');
    await InventoryDao.addWeaponToShip(barco3, 'cannon-base');
    const listBarcos = [
      { userShipId: barco1.id,
        position: { x: 1, y: 1 },
        orientation: 'N'
      }, 
      {
        userShipId: barco2.id,
        position: {x:5, y:2},
        orientation: 'N'
      }, 
      {
        userShipId: barco3.id,
        position: { x: 10, y: 3},
        orientation: 'N'
      }];
    const deckTemplate = {
      userId: usuarioCreado.id,
      deckName: 'Mazo Base',
      shipIds: listBarcos,
      isActive: true
    };
    InventoryDao.createDeck(deckTemplate);
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