/**
 * Fachada raíz de componentes compartidos (Shared).
 * Expone middlewares, modelos, servicios y utilidades de factoría.
 */
import * as models from './models/index.js';
import * as services from './services/index.js';

export * from './middlewares/index.js';
export * from './models/testFactory.js';

export {
    models,
    services
};
