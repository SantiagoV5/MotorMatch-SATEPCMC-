const { logger } = require('../utils/logger');

/**
 * Manejador centralizado de errores de Express.
 * Captura cualquier error lanzado con next(err) desde controllers o middlewares.
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, _next) {
  // Log siempre: método, ruta y error completo para debugging
  logger.error(`[${req.method} ${req.path}] ${err.message}`);
  if (err.stack) logger.error(err.stack);

  // Errores de validación de Joi (lanzados desde validation.middleware)
  if (err.isJoi) {
    return res.status(400).json({
      message: 'Datos inválidos',
      details: err.details.map((d) => d.message),
    });
  }

  // Errores de Prisma — registro duplicado (unique constraint)
  if (err.code === 'P2002') {
    return res.status(409).json({
      message: 'Ya existe un registro con esos datos (duplicado)',
    });
  }

  // Errores de negocio que el código lanza manualmente (ej: credenciales)
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      message: err.message,
    });
  }

  // Error genérico no controlado
  return res.status(500).json({
    message: 'Error interno del servidor',
  });
}

module.exports = errorHandler;
