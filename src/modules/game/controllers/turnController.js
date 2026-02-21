import { Match, MatchPlayer, sequelize } from '../../../shared/models/index.js';

/**
 * Finaliza el turno del jugador actual y prepara el estado para el oponente
 * @param {object} req - Petición con matchId
 * @param {object} res - Respuesta con el nuevo estado del turno
 * @param {function} next - Middleware de error
 */
export const endTurn = async (req, res, next) => {
    const transaccion = await sequelize.transaction();
    try {
        const { matchId } = req.params;

        const partida = await Match.findByPk(matchId, {
            include: [{ model: MatchPlayer }],
            transaction: transaccion
        });

        if (!partida || partida.status !== 'PLAYING') {
            await transaccion.rollback();
            return res.status(404).json({ message: 'Partida no activa' });
        }

        // NOTE: primer turno sin ID asignado... se asigna si es necesario
        if (!partida.currentTurnPlayerId) {
            partida.currentTurnPlayerId = req.user.id;
        }

        if (partida.currentTurnPlayerId !== req.user.id) {
            await transaccion.rollback();
            return res.status(403).json({ message: 'No es tu turno' });
        }

        const jugadorActual = partida.MatchPlayers.find(p => p.userId === req.user.id);
        const oponente = partida.MatchPlayers.find(p => p.userId !== req.user.id);

        if (!oponente) {
            await transaccion.rollback();
            return res.status(400).json({ message: 'No se encontró un oponente en esta partida' });
        }

        partida.turnNumber += 1;
        partida.currentTurnPlayerId = oponente.userId;

        const expiracion = new Date();
        expiracion.setMinutes(expiracion.getMinutes() + 2); // 2 minutos para fin de turno PLACEHOLDER
        partida.turnExpiresAt = expiracion;

        oponente.fuelReserve = Math.min(30, oponente.fuelReserve + 10);
        oponente.ammoCurrent = 5;

        await partida.save({ transaction: transaccion });
        await oponente.save({ transaction: transaccion });

        await transaccion.commit();

        res.json({
            message: 'Turno finalizado',
            nextPlayerId: partida.currentTurnPlayerId,
            turnNumber: partida.turnNumber,
            nextPlayerResources: {
                fuel: oponente.fuelReserve,
                ammo: oponente.ammoCurrent
            }
        });
    } catch (error) {
        if (transaccion) await transaccion.rollback();
        next(error);
    }
};