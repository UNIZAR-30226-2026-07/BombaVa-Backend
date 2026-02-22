/**
 * Test de Integración: API de Mazos
 * Valida la creación de mazos con la restricción de 15x5 de la V1.
 */
import request from 'supertest';
import app from '../../../app.js';
import { sequelize } from '../../../config/db.js';
import User from '../../auth/models/User.js';
import { generarTokenAcceso } from '../../auth/services/authService.js';

describe('DeckController Integration (Colocated)', () => {
    let token, userId;

    beforeAll(async () => {
        await sequelize.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
        await sequelize.sync({ force: true });

        const user = await User.create({ username: 'deck_tester', email: 'd@t.com', password_hash: '1' });
        userId = user.id;
        token = generarTokenAcceso(user);
    });

    afterAll(async () => {
        await sequelize.close();
    });

    it('POST /api/inventory/decks - Debe fallar si la posición Y es > 4 (Límite V1)', async () => {
        const res = await request(app)
            .post('/api/inventory/decks')
            .set('Authorization', `Bearer ${token}`)
            .send({
                deckName: 'Mazo Inválido',
                shipIds: [{ userShipId: 'some-uuid', position: { x: 0, y: 10 }, orientation: 'N' }]
            });

        expect(res.status).toBe(400);
        expect(res.body.message).toContain('fuera de los límites');
    });

    it('POST /api/inventory/decks - Debe crear mazo si está dentro de 15x5', async () => {
        const res = await request(app)
            .post('/api/inventory/decks')
            .set('Authorization', `Bearer ${token}`)
            .send({
                deckName: 'Mazo Válido',
                shipIds: [{ userShipId: '550e8400-e29b-41d4-a716-446655440000', position: { x: 5, y: 2 }, orientation: 'N' }]
            });

        expect(res.status).toBe(201);
        expect(res.body.deckName).toBe('Mazo Válido');
    });
});