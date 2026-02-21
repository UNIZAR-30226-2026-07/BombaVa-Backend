import { FleetDeck, Match, MatchPlayer, ShipInstance, ShipTemplate, UserShip } from '../../../shared/models/index.js';

/**
 * Inicializa la persistencia de la partida, configurando bandos y barcos con sus HP reales
 * @param {Array} usuarios - Lista de participantes {id, socketId}
 * @returns {Promise<Object>} Instancia de la partida creada
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
            await instanciarBarcosMazo(partida.id, usuario.id, bando, mazo.shipIds);
        }
    }

    return partida;
};

/**
 * Crea las instancias de barcos en el tablero con HP dinámico basado en plantilla
 * @param {string} matchId - ID de la partida
 * @param {string} playerId - ID del jugador
 * @param {string} bando - NORTH o SOUTH
 * @param {Array} shipConfigs - Configuración del mazo
 */
async function instanciarBarcosMazo(matchId, playerId, bando, shipConfigs) {
    for (const config of shipConfigs) {
        const barcoUsuario = await UserShip.findByPk(config.userShipId, {
            include: [{ model: ShipTemplate }]
        });

        const hpInicial = barcoUsuario?.ShipTemplate?.baseMaxHp || 10;

        await ShipInstance.create({
            matchId,
            playerId,
            userShipId: config.userShipId,
            x: config.position.x,
            y: (bando === 'NORTH') ? config.position.y : (14 - config.position.y),
            orientation: (bando === 'NORTH') ? config.orientation : 'S',
            currentHp: hpInicial
        });
    }
}