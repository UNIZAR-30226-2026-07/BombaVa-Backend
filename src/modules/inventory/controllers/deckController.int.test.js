/**
 * Test de Integración: API de Mazos
 * Valida la creación y límites de formación del puerto.
 */
import request from 'supertest';
import app from '../../../app.js';
import { sequelize } from '../../../config/db.js';
import { createFullUserContext } from '../../../shared/models/testFactory.js';
import { generarTokenAcceso } from '../../auth/services/authService.js';

describe('DeckController Integration (Refactored)', () => {
    let setup, token;

    beforeAll(async () => {
        await sequelize.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
        await sequelize.sync({ force: true });

        setup = await createFullUserContext('deck_user', 'deck@test.com');
        token = generarTokenAcceso(setup.user);
    });

    afterAll(async () => {
        await sequelize.close();
    });

    it('POST /api/inventory/decks - Debe rechazar formación fuera de 15x5', async () => {
        const res = await request(app)
            .post('/api/inventory/decks')
            .set('Authorization', `Bearer ${token}`)
            .send({
                deckName: 'Mazo Ilegal',
                shipIds: [{ userShipId: setup.uShip.id, position: { x: 0, y: 10 }, orientation: 'N' }]
            });

        expect(res.status).toBe(400);
    });

    it('POST /api/inventory/decks - Debe crear mazo correctamente en área permitida', async () => {
        const res = await request(app)
            .post('/api/inventory/decks')
            .set('Authorization', `Bearer ${token}`)
            .send({
                deckName: 'Mazo Legal',
                shipIds: [{ userShipId: setup.uShip.id, position: { x: 0, y: 2 }, orientation: 'N' }]
            });

        expect(res.status).toBe(201);
        expect(res.body.deckName).toBe('Mazo Legal');
    });
});