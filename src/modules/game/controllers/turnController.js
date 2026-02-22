import { Match, MatchPlayer, sequelize } from '../../../shared/models/index.js';
import * as matchService from '../services/matchService.js';

/**
 * Endpoint para finalizar el turno
 */
export const endTurn = async (req, res, next) => {
    const transaccion = await sequelize.transaction();
    try {
        const { matchId } = req.params;
        const partida = await Match.findByPk(matchId, { include: [{ model: MatchPlayer }], transaction: transaccion });

        if (!partida || partida.status !== 'PLAYING' || (partida.currentTurnPlayerId && partida.currentTurnPlayerId !== req.user.id)) {
            await transaccion.rollback();
            return res.status(403).json({ message: 'No es tu turno o partida no activa' });
        }

        const oponente = partida.MatchPlayers.find(p => p.userId !== req.user.id);
        if (!oponente) {
            await transaccion.rollback();
            return res.status(400).json({ message: 'Error de integridad' });
        }

        const nuevosRecursos = matchService.calcularRegeneracionRecursos({ fuel: oponente.fuelReserve });
        oponente.fuelReserve = nuevosRecursos.fuel;
        oponente.ammoCurrent = nuevosRecursos.ammo;

        partida.turnNumber += 1;
        partida.currentTurnPlayerId = oponente.userId;

        await Promise.all([partida.save({ transaction: transaccion }), oponente.save({ transaction: transaccion })]);
        await transaccion.commit();

        res.json({ message: 'Turno finalizado', nextPlayerId: partida.currentTurnPlayerId, turnNumber: partida.turnNumber });
    } catch (error) {
        if (transaccion) await transaccion.rollback();
        next(error);
    }
};