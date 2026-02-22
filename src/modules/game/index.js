/**
 * Fachada del módulo de Juego (Matchmaking y Estados).
 * Expone las rutas de consulta y servicios de orquestación.
 */
import matchRoutes from './routes/matchRoutes.js';
import * as matchService from './services/matchService.js';
import * as statusService from './services/matchStatusService.js';

export {
    matchRoutes,
    matchService,
    statusService
};
