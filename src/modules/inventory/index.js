/**
 * Fachada del módulo de Inventario.
 */
import InventoryDao from './dao/InventoryDao.js';
import FleetDeck from './models/FleetDeck.js';
import ShipTemplate from './models/ShipTemplate.js';
import UserShip from './models/UserShip.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import * as inventoryService from './services/inventoryService.js';

export {
    FleetDeck, InventoryDao, inventoryRoutes,
    inventoryService, ShipTemplate, UserShip
};
