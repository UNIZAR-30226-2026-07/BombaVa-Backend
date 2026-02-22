/**
 * Controlador de Turnos
 * Gestiona la transición de poder entre jugadores y la regeneración de recursos.
 */
import { Match, MatchPlayer, sequelize } from '../../../shared/models/index.js';
import * as matchService from '../services/matchService.js';

/**
 * Finaliza el turno actual y cede el control al oponente
 */
export const endTurn = async (req, res, next) => {
    const { matchId } = req.params;
    const transaccion = await sequelize.transaction();

    try {
        const partida = await Match.findByPk(matchId, {
            include: [MatchPlayer],
            transaction: transaccion
        });

        if (!partida || partida.currentTurnPlayerId !== req.user.id) {
            await transaccion.rollback();
            return res.status(403).json({ message: 'No es tu turno' });
        }

        const oponente = partida.MatchPlayers.find(p => p.userId !== req.user.id);

        const nuevosRecursos = matchService.calcularRegeneracionTurno({
            fuel: oponente.fuelReserve,
            ammo: oponente.ammoCurrent
        });

        oponente.fuelReserve = nuevosRecursos.fuel;
        oponente.ammoCurrent = nuevosRecursos.ammo;

        partida.currentTurnPlayerId = oponente.userId;
        partida.turnNumber += 1;

        await Promise.all([
            partida.save({ transaction: transaccion }),
            oponente.save({ transaction: transaccion })
        ]);

        await transaccion.commit();

        res.json({
            message: 'Turno finalizado',
            nextPlayerId: partida.currentTurnPlayerId,
            turnNumber: partida.turnNumber,
            nextPlayerResources: nuevosRecursos
        });
    } catch (error) {
        if (transaccion) await transaccion.rollback();
        next(error);
    }
};