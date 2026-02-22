/**
 * Fachada del módulo de Inventario.
 * Expone las rutas de gestión de barcos y mazos.
 */
import inventoryRoutes from './routes/inventoryRoutes.js';
import * as inventoryService from './services/inventoryService.js';

export {
    inventoryRoutes,
    inventoryService
};
