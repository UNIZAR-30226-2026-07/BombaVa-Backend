import { FleetDeck, Match, MatchPlayer } from '../../../shared/models/index.js';

/**
 * Recupera el estado completo de una partida para sincronización del cliente
 * @param {object} req - Petición con matchId
 * @param {object} res - Respuesta con datos de partida y jugadores
 * @param {function} next - Middleware de error
 */
export const getMatchStatus = async (req, res, next) => {
    try {
        const { matchId } = req.params;
        const partida = await Match.findByPk(matchId, {
            include: [
                { model: MatchPlayer }
            ]
        });

        if (!partida) {
            return res.status(404).json({ message: 'Partida no encontrada' });
        }

        res.json(partida);
    } catch (error) {
        next(error);
    }
};

/**
 * Gestiona la petición de pausa de una partida
 * @param {object} req - Petición con matchId
 * @param {object} res - Confirmación de la petición
 * @param {function} next - Middleware de error
 */
export const requestPause = async (req, res, next) => {
    try {
        const { matchId } = req.params;
        res.json({ message: 'Petición de pausa recibida, esperando al oponente', matchId });
    } catch (error) {
        next(error);
    }
};

/**
 * Lógica interna para crear la partida en base de datos tras el matchmaking
 * @param {Array} usuarios - Lista de dos objetos usuario {id, socketId}
 * @returns {Promise<Object>} Instancia de la partida creada
 */
export const initializeMatchPersistence = async (usuarios) => {
    const mapaInicial = {
        size: 15,
        obstacles: []
    };

    const nuevaPartida = await Match.create({
        status: 'PLAYING',
        mapTerrain: mapaInicial,
        turnNumber: 1
    });

    for (let i = 0; i < usuarios.length; i++) {
        const usuario = usuarios[i];
        const mazoActivo = await FleetDeck.findOne({
            where: { userId: usuario.id, isActive: true }
        });

        const bando = (i === 0) ? 'NORTH' : 'SOUTH';

        await MatchPlayer.create({
            matchId: nuevaPartida.id,
            userId: usuario.id,
            side: bando,
            deckSnapshot: mazoActivo ? mazoActivo.shipIds : []
        });
    }

    return nuevaPartida;
};