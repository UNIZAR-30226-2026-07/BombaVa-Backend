/**
 * Manejador interno de eventos de combate (Cañón, Torpedos, Minas).
 */
import { GAME_RULES } from '../../../config/gameRules.js';
import { Match, MatchPlayer, Projectile, sequelize, ShipInstance } from '../../../shared/models/index.js';
import * as combatService from '../services/combatService.js';

export const registerCombatHandlers = (io, socket) => {

    /**
     * Ataque de cañón instantáneo.
     */
    socket.on('ship:attack:cannon', async (data) => {
        const { matchId, shipId, target } = data;
        const userId = socket.data.user.id;
        const transaction = await sequelize.transaction();

        try {
            const costes = combatService.obtenerCostesCombate();
            const partida = await Match.findByPk(matchId, { transaction });
            const barco = await ShipInstance.findByPk(shipId, { transaction });
            const jugador = await MatchPlayer.findOne({ where: { matchId, userId }, transaction });

            if (barco.lastAttackTurn === partida.turnNumber || jugador.ammoCurrent < costes.CANNON) {
                throw new Error('Ataque no disponible o munición insuficiente');
            }

            const objetivo = await ShipInstance.findOne({
                where: { matchId, x: target.x, y: target.y, isSunk: false },
                transaction
            });

            let targetHp = null;
            if (objetivo) {
                await combatService.aplicarDañoImpacto(objetivo, 'CANNON', transaction);
                targetHp = objetivo.currentHp;
            }

            jugador.ammoCurrent -= costes.CANNON;
            barco.lastAttackTurn = partida.turnNumber;

            await Promise.all([barco.save({ transaction }), jugador.save({ transaction })]);
            await transaction.commit();

            io.to(matchId).emit('ship:attacked', { attackerId: userId, hit: !!objetivo, target, targetHp, ammoCurrent: jugador.ammoCurrent });
        } catch (error) {
            await transaction.rollback();
            socket.emit('game:error', { message: error.message });
        }
    });

    /**
     * Lanzamiento de torpedo (Proyectil dinámico).
     */
    socket.on('ship:attack:torpedo', async (data) => {
        const { matchId, shipId } = data;
        const userId = socket.data.user.id;
        const transaction = await sequelize.transaction();

        try {
            const costes = combatService.obtenerCostesCombate();
            const partida = await Match.findByPk(matchId, { transaction });
            const barco = await ShipInstance.findByPk(shipId, { transaction });
            const jugador = await MatchPlayer.findOne({ where: { matchId, userId }, transaction });

            if (!barco || jugador.ammoCurrent < costes.TORPEDO) {
                throw new Error('Munición insuficiente');
            }

            const vector = combatService.calcularVectorProyectil(barco.orientation);

            await Projectile.create({
                matchId, ownerId: userId, type: 'TORPEDO',
                x: barco.x + vector.vx, y: barco.y + vector.vy,
                vectorX: vector.vx, vectorY: vector.vy,
                lifeDistance: GAME_RULES.COMBAT.TORPEDO_LIFE
            }, { transaction });

            jugador.ammoCurrent -= costes.TORPEDO;
            barco.lastAttackTurn = partida.turnNumber;

            await Promise.all([barco.save({ transaction }), jugador.save({ transaction })]);
            await transaction.commit();

            io.to(matchId).emit('projectile:launched', { type: 'TORPEDO', attackerId: userId, ammoCurrent: jugador.ammoCurrent });
        } catch (error) {
            await transaction.rollback();
            socket.emit('game:error', { message: error.message });
        }
    });

    /**
     * Colocación de mina (Proyectil estático).
     */
    socket.on('ship:attack:mine', async (data) => {
        const { matchId, shipId, target } = data;
        const userId = socket.data.user.id;
        const transaction = await sequelize.transaction();

        try {
            const costes = combatService.obtenerCostesCombate();
            const partida = await Match.findByPk(matchId, { transaction });
            const barco = await ShipInstance.findByPk(shipId, { transaction });
            const jugador = await MatchPlayer.findOne({ where: { matchId, userId }, transaction });

            if (jugador.ammoCurrent < costes.MINE || !combatService.validarAdyacencia({ x: barco.x, y: barco.y }, target)) {
                throw new Error('No permitido o fuera de rango');
            }

            await Projectile.create({
                matchId, ownerId: userId, type: 'MINE',
                x: target.x, y: target.y,
                lifeDistance: GAME_RULES.COMBAT.MINE_LIFE
            }, { transaction });

            jugador.ammoCurrent -= costes.MINE;
            barco.lastAttackTurn = partida.turnNumber;

            await Promise.all([barco.save({ transaction }), jugador.save({ transaction })]);
            await transaction.commit();

            io.to(matchId).emit('projectile:launched', { type: 'MINE', attackerId: userId, ammoCurrent: jugador.ammoCurrent });
        } catch (error) {
            await transaction.rollback();
            socket.emit('game:error', { message: error.message });
        }
    });
};