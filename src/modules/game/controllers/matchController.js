import { FleetDeck, Match, MatchPlayer, ShipInstance } from '../../../shared/models/index.js';

/**
 * Recupera el estado de una partida incluyendo sus jugadores
 * @param {object} req - Objeto de petición de Express
 * @param {object} res - Objeto de respuesta de Express
 * @param {function} next - Función para manejo de errores
 */
export const getMatchStatus = async (req, res, next) => {
    try {
        const { matchId } = req.params;
        const partida = await Match.findByPk(matchId, {
            include: [{ model: MatchPlayer }]
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
 * Registra una solicitud de pausa para la partida actual
 * @param {object} req - Objeto de petición de Express
 * @param {object} res - Objeto de respuesta de Express
 * @param {function} next - Función para manejo de errores
 */
export const requestPause = async (req, res, next) => {
    try {
        const { matchId } = req.params;
        res.json({ message: 'Petición de pausa procesada', matchId });
    } catch (error) {
        next(error);
    }
};

/**
 * Inicializa la estructura de la partida en la base de datos y crea las instancias de barcos
 * @param {Array} usuarios - Lista de usuarios participantes {id, socketId}
 * @returns {Promise<Object>} La instancia de la partida creada
 */
export const initializeMatchPersistence = async (usuarios) => {
    const partida = await Match.create({
        status: 'PLAYING',
        mapTerrain: { size: 15, obstacles: [] },
        turnNumber: 1
    });

    for (let i = 0; i < usuarios.length; i++) {
        const usuario = usuarios[i];
        const mazo = await FleetDeck.findOne({
            where: { userId: usuario.id, isActive: true }
        });

        const bando = (i === 0) ? 'NORTH' : 'SOUTH';

        await MatchPlayer.create({
            matchId: partida.id,
            userId: usuario.id,
            side: bando,
            deckSnapshot: mazo ? mazo.shipIds : []
        });

        if (mazo && mazo.shipIds) {
            for (const config of mazo.shipIds) {
                await ShipInstance.create({
                    matchId: partida.id,
                    playerId: usuario.id,
                    userShipId: config.userShipId,
                    x: config.position.x,
                    y: (bando === 'NORTH') ? config.position.y : (14 - config.position.y),
                    orientation: (bando === 'NORTH') ? config.orientation : 'S',
                    currentHp: 10 // FIXME: Valor temporal hasta tener lógica de plantillas
                });
            }
        }
    }

    return partida;
};