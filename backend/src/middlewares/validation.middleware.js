/**
 * Fábrica de middleware de validación con Joi.
 * Uso: router.post('/ruta', validate(miSchema), controller)
 *
 * Si el body no cumple el schema, lanza un error Joi que el
 * errorHandler central convierte en 400 automáticamente.
 */
function validate(schema) {
  return (req, _res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,   // devuelve TODOS los errores, no solo el primero
      stripUnknown: true,  // elimina campos no definidos en el schema
    });

    if (error) {
      error.isJoi = true;  // flag que usa errorHandler para devolver 400
      return next(error);
    }

    req.body = value; // body limpio y normalizado (trim, lowercase, etc.)
    next();
  };
}

module.exports = { validate };
