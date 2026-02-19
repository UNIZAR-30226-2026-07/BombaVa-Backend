/**
 * Global Error Handling Middleware
 */
export const errorHandler = (err, req, res, next) => {
    // Errores de validación de Sequelize (Unique constraints, etc)
    if (err.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({
            errors: err.errors.map(e => ({ msg: e.message, path: e.path }))
        });
    }

    // Errores de validación general
    if (err.name === 'SequelizeValidationError') {
        return res.status(400).json({
            errors: err.errors.map(e => ({ msg: e.message, path: e.path }))
        });
    }

    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

    res.status(statusCode).json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};