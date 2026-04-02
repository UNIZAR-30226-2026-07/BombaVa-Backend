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


    it('PUT /api/inventory/decks/:deckId - Debe actualizar el nombre y la formación de un mazo existente', async () => {
        const res = await request(app)
            .put(`/api/inventory/decks/${setup.deck.id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                deckName: 'Mazo Renombrado',
                shipIds: [{ userShipId: setup.uShip.id, position: { x: 5, y: 3 }, orientation: 'E' }]
            });

        expect(res.status).toBe(200);
        expect(res.body.deckName).toBe('Mazo Renombrado');
        expect(res.body.shipIds[0].orientation).toBe('E');
        expect(res.body.shipIds[0].position.x).toBe(5);
    });

    it('PUT /api/inventory/decks/:deckId - Debe rechazar la actualización si la nueva formación sale del puerto', async () => {
        const res = await request(app)
            .put(`/api/inventory/decks/${setup.deck.id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                shipIds: [{ userShipId: setup.uShip.id, position: { x: 5, y: 10 }, orientation: 'N' }]
            });

        expect(res.status).toBe(400);
        expect(res.body.message).toContain('fuera de los límites');
    });

    it('DELETE /api/inventory/decks/:deckId - Debe permitir eliminar un mazo si el usuario tiene más de uno', async () => {
        // Obtenemos los mazos actuales setup y el del 2o test
        const getRes = await request(app)
            .get('/api/inventory/decks')
            .set('Authorization', `Bearer ${token}`);
        
        // Buscamos el ID del Mazo Legal pa borrarlo
        const deckToDelete = getRes.body.find(d => d.deckName === 'Mazo Legal');

        const res = await request(app)
            .delete(`/api/inventory/decks/${deckToDelete.id}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.message).toContain('eliminado correctamente');
    });

    it('DELETE /api/inventory/decks/:deckId - Debe rechazar la eliminación si es el único mazo que le queda al usuario', async () => {
        // Como borramos el Mazo Legal en el test anterior, ahora solo le queda el Mazo Renombrado
        const res = await request(app)
            .delete(`/api/inventory/decks/${setup.deck.id}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(400);
        expect(res.body.message).toContain('único mazo');
    });
});
