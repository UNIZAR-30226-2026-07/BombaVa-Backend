/**
 * Fachada del módulo de Juego.
 */
import Match from './models/Match.js';
import MatchPlayer from './models/MatchPlayer.js';
import matchRoutes from './routes/matchRoutes.js';
import { matchService, statusService } from './services/index.js';
import { registerGameHandlers } from './sockets/index.js';

export {
    Match,
    MatchPlayer,
    matchRoutes,
    matchService,
    registerGameHandlers,
    statusService
};
