import request from 'supertest';
import app from '../../../src/app.js';
import { sequelize, ShipTemplate, User, UserShip } from '../../../src/shared/models/index.js';

/**
 * Pruebas de integración funcional para la API de mazos de flota
 */
describe('Fleet Decks API Functional Tests (Integration)', () => {
    let token;
    let userId;
    let userShipId;

    beforeAll(async () => {
        await sequelize.query('DROP SCHEMA public CASCADE;');
        await sequelize.query('CREATE SCHEMA public;');
        await sequelize.sync({ force: true });

        const userRes = await request(app).post('/api/auth/register').send({
            username: 'deck_master',
            email: 'decks@test.com',
            contrasena: 'Pass1234'
        });
        token = userRes.body.token;

        const user = await User.findOne({ where: { email: 'decks@test.com' } });
        userId = user.id;

        await ShipTemplate.create({
            slug: 'lancha',
            name: 'Lancha',
            width: 1,
            height: 1,
            baseMaxHp: 10,
            supplyCost: 5
        });

        const ship = await UserShip.create({
            userId: userId,
            templateSlug: 'lancha'
        });
        userShipId = ship.id;
    });

    afterAll(async () => {
        await sequelize.close();
    });

    it('Debe crear un mazo con configuración de mini-tablero válida', async () => {
        const deckData = {
            deckName: 'Mi Mazo Pro',
            shipIds: [
                { userShipId: userShipId, position: { x: 5, y: 2 }, orientation: 'N' }
            ]
        };

        const response = await request(app)
            .post('/api/inventory/decks')
            .set('Authorization', `Bearer ${token}`)
            .send(deckData);

        expect(response.status).toBe(201);
        expect(response.body.deckName).toBe('Mi Mazo Pro');
    });

    it('Debe activar un mazo y desactivar los demás', async () => {
        const deck1Res = await request(app)
            .post('/api/inventory/decks')
            .set('Authorization', `Bearer ${token}`)
            .send({
                deckName: 'Mazo Alpha',
                shipIds: [{ userShipId: userShipId, position: { x: 1, y: 1 }, orientation: 'N' }]
            });

        expect(deck1Res.status).toBe(201);

        const deck2Res = await request(app)
            .post('/api/inventory/decks')
            .set('Authorization', `Bearer ${token}`)
            .send({
                deckName: 'Mazo Beta',
                shipIds: [{ userShipId: userShipId, position: { x: 2, y: 1 }, orientation: 'N' }]
            });

        expect(deck2Res.status).toBe(201);

        const activateRes = await request(app)
            .patch(`/api/inventory/decks/${deck2Res.body.id}/activate`)
            .set('Authorization', `Bearer ${token}`);

        expect(activateRes.status).toBe(200);
        expect(activateRes.body.deck.isActive).toBe(true);

        const listRes = await request(app)
            .get('/api/inventory/decks')
            .set('Authorization', `Bearer ${token}`);

        const d1 = listRes.body.find(d => d.id === deck1Res.body.id);
        expect(d1.isActive).toBe(false);
    });
});