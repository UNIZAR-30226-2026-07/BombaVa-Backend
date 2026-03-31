/**
 * Fachada con un único acceso
 */
import * as FleetDeckDao from './FleetDeckDao.js';
import * as UserShipDao from './UserShipDao.js';

export default {
    ...UserShipDao,
    ...FleetDeckDao
};