import { validationResult } from 'express-validator';
import InventoryDao from '../dao/InventoryDao.js';

/**
 * Obtiene la colección de barcos del usuario autenticado
 * @param {object} req - Petición de Express
 * @param {object} res - Respuesta de Express
 * @param {function} next - Middleware de error
 */
export const getMyShips = async (req, res, next) => {
    try {
        const barcos = await InventoryDao.findUserShips(req.user.id);
        res.json(barcos);
    } catch (error) {
        next(error);
    }
};

/**
 * Asocia un armamento específico a un barco del inventario
 * @param {object} req - Petición con shipId y weaponSlug
 * @param {object} res - Respuesta con el barco actualizado
 * @param {function} next - Middleware de error
 */
export const equipWeapon = async (req, res, next) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
        return res.status(400).json({ errors: errores.array() });
    }

    try {
        const { shipId } = req.params;
        const { weaponSlug } = req.body;

        const barco = await InventoryDao.findByIdAndUser(shipId, req.user.id);

        if (!barco) {
            return res.status(404).json({ message: 'Barco no encontrado en tu inventario' });
        }

        const barcoActualizado = await InventoryDao.updateShipStats(barco, { equippedWeapon: weaponSlug });

        res.json(barcoActualizado);
    } catch (error) {
        next(error);
    }
};

/**
 * Recupera todos los mazos de flota configurados por el usuario
 * @param {object} req - Petición de Express
 * @param {object} res - Respuesta de Express
 * @param {function} next - Middleware de error
 */
export const getMyDecks = async (req, res, next) => {
    try {
        const mazos = await InventoryDao.findUserDecks(req.user.id);
        res.json(mazos);
    } catch (error) {
        next(error);
    }
};

/**
 * Registra una nueva configuración de mazo de flota
 * @param {object} req - Petición con nombre y configuración de barcos
 * @param {object} res - Respuesta con el mazo creado
 * @param {function} next - Middleware de error
 */
export const createDeck = async (req, res, next) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
        return res.status(400).json({ errors: errores.array() });
    }

    try {
        const { deckName, shipIds } = req.body;

        for (const configuracion of shipIds) {
            if (configuracion.position.x < 0 || configuracion.position.x > 14 ||
                configuracion.position.y < 0 || configuracion.position.y > 4) {
                return res.status(400).json({ message: 'Posición de despliegue fuera de límites (5x15)' });
            }
        }

        const nuevoMazo = await InventoryDao.createDeck({
            userId: req.user.id,
            deckName,
            shipIds,
            isActive: false
        });

        res.status(201).json(nuevoMazo);
    } catch (error) {
        next(error);
    }
};

/**
 * Activa un mazo para ser usado en el sistema de emparejamiento
 * @param {object} req - Petición con el ID del mazo
 * @param {object} res - Respuesta de confirmación
 * @param {function} next - Middleware de error
 */
export const setActiveDeck = async (req, res, next) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
        return res.status(400).json({ errors: errores.array() });
    }

    try {
        const { deckId } = req.params;
        const mazoActivo = await InventoryDao.activateDeck(deckId, req.user.id);

        if (!mazoActivo) {
            return res.status(404).json({ message: 'Mazo no encontrado o no pertenece al usuario' });
        }

        res.json({ message: 'Mazo activado correctamente', deck: mazoActivo });
    } catch (error) {
        next(error);
    }
};