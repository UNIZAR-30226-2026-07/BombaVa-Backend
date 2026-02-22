/**
 * Fachada del módulo de Juego (Matchmaking y Estados).
 * Expone las rutas de consulta y los manejadores de eventos en tiempo real.
 */
import matchRoutes from './routes/matchRoutes.js';
import * as matchService from './services/matchService.js';
import { registerGameHandlers } from './sockets/index.js';

export {
    matchRoutes,
    matchService,
    registerGameHandlers
};
