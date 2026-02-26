/**
 * Fachada raíz de componentes compartidos (Shared).
 * Re-exporta modelos de forma nominal para compatibilidad con factorías.
 */
import * as services from './services/index.js';

export * from './middlewares/index.js';
export * from './models/index.js';
export * from './models/testFactory.js';

export {
    services
};
