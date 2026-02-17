
import build from './User.js';

describe('User Model Unit Tests', () => {
    it('Debe fallar si el email no tiene formato correcto', async () => {
        const user = new build({
            username: 'test',
            email: 'esto-no-es-un-email',
            password_hash: '123'
        });

        try {
            await user.validate();
            fail('La validación debería haber fallado para un email incorrecto');
        } catch (err) {
            expect(err.name).toBe('SequelizeValidationError');
            expect(err.errors[0].path).toBe('email');
        }
    });

    it('Debe asignar el ELO por defecto de 1200', () => {
        const user = new build({ username: 'raul', email: 'r@u.es' });
        expect(user.elo_rating).toBe(1200);
    });
});