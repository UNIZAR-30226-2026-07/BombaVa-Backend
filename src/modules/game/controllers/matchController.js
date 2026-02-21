import { FleetDeck, Match, MatchPlayer, ShipInstance } from '../../../shared/models/index.js';

/**
 * Recupera el estado completo de una partida
 * @param {object} req - Petición con matchId
 * @param {object} res - Datos de la partida
 * @param {function} next - Middleware de error
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
 * Gestiona peticiones de pausa
 * @param {object} req - Petición
 * @param {object} res - Confirmación
 * @param {function} next - Middleware de error
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
 * Recupera el historial de partidas de un usuario
 * @param {object} req - Petición
 * @param {object} res - Lista de partidas
 * @param {function} next - Middleware de error
 */
export const getMatchHistory = async (req, res, next) => {
    try {
        const partidas = await Match.findAll({
            include: [{
                model: MatchPlayer,
                where: { userId: req.user.id }
            }],
            order: [['created_at', 'DESC']]
        });
        res.json(partidas);
    } catch (error) {
        next(error);
    }
};

/**
 * Inicializa la persistencia de una partida nueva
 * @param {Array} usuarios - Usuarios participantes
 * @returns {Promise<Object>} Partida creada
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
            fuelReserve: 10,
            ammoCurrent: 5,
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
                    currentHp: 10
                });
            }
        }
    }

    return partida;
};