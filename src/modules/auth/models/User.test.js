/**
 * Test Unitario: Validaciones del Modelo User
 */
import User from './User.js';

describe('User Model Unit Validations', () => {
    it('Debe fallar si el email no tiene un formato válido', async () => {
        const user = User.build({
            username: 'tester',
            email: 'esto-no-es-un-email',
            password_hash: '123'
        });

        await expect(user.validate()).rejects.toThrow();
    });

    it('Debe asignar el ELO inicial de 1200 por defecto', () => {
        const user = User.build({ username: 'nuevo', email: 'n@t.com' });
        expect(user.elo_rating).toBe(1200);
    });
});