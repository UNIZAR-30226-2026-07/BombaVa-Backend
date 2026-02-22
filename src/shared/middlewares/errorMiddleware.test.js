/**
 * Test Unitario: Middleware de Errores
 * Valida que los errores técnicos se traduzcan a respuestas JSON adecuadas para el cliente.
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

    it('Debe capturar errores de validación de Sequelize y devolver 400', () => {
        const error = {
            name: 'SequelizeValidationError',
            errors: [{ message: 'Email inválido', path: 'email' }]
        };

        errorHandler(error, req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            errors: expect.arrayContaining([expect.objectContaining({ msg: 'Email inválido' })])
        }));
    });

    it('Debe devolver 500 para errores genéricos desconocidos', () => {
        const error = new Error('Error Genérico');
        errorHandler(error, req, res, next);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: 'Error Genérico'
        }));
    });
});