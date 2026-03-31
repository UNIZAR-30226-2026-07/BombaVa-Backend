/**
 * Dao para los decks de barcos
 */
import { sequelize } from '../../../config/db.js';
import { FleetDeck } from '../../../shared/models/index.js';

export const findUserDecks = async (userId) => {
    return await FleetDeck.findAll({ where: { userId } });
};

export const findUserActiveDecks = async (userId) => {
    return await FleetDeck.findOne({ where: { userId: userId, isActive: true } });
};

export const createDeck = async (deckData) => {
    return await FleetDeck.create(deckData);
};

export const activateDeck = async (deckId, userId) => {
    const transaccion = await sequelize.transaction();
    try {
        const mazoAActivar = await FleetDeck.findOne({
            where: { id: deckId, userId: userId },
            transaction: transaccion
        });

        if (!mazoAActivar) {
            await transaccion.rollback();
            return null;
        }

        await FleetDeck.update({ isActive: false }, {
            where: { userId: userId },
            transaction: transaccion
        });

        mazoAActivar.isActive = true;
        await mazoAActivar.save({ transaction: transaccion });

        await transaccion.commit();
        return mazoAActivar;
    } catch (error) {
        if (transaccion) await transaccion.rollback();
        throw error;
    }
};