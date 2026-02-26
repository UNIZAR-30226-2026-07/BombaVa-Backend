/**
 * Test Unitario: Middleware de Errores
 */
import { jest } from '@jest/globals';
import { errorHandler } from './errorMiddleware.js';

describe('ErrorMiddleware Unit Tests', () => {
    let req, res, next;

    beforeEach(() => {
        req = {};
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            statusCode: 200
        };
        next = jest.fn();
    });

    it('Debe devolver 400 y mapear errores cuando Sequelize lanza una validación', () => {
        const error = {
            name: 'SequelizeValidationError',
            errors: [{ message: 'Falta nombre', path: 'nombre' }]
        };

        errorHandler(error, req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            errors: expect.arrayContaining([expect.objectContaining({ msg: 'Falta nombre' })])
        }));
    });

    it('Debe devolver 500 ante errores desconocidos de la aplicación', () => {
        const error = new Error('Fallo crítico de sistema');
        errorHandler(error, req, res, next);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: 'Fallo crítico de sistema'
        }));
    });
});