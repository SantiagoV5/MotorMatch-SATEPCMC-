/**
 * Fábrica de middleware de validación con Joi.
 * Uso: router.post('/ruta', validate(miSchema), controller)
 * O para query: router.get('/ruta', validate(miSchema, 'query'), controller)
 *
 * Si el body/query no cumple el schema, lanza un error Joi que el
 * errorHandler central convierte en 400 automáticamente.
 * 
 * @param {Object} schema - Esquema de Joi para validación
 * @param {string} source - De dónde obtener los datos: 'body' (default) o 'query'
 */
function validate(schema, source = 'body') {
  return (req, _res, next) => {
    const dataToValidate = source === 'query' ? req.query : req.body;

    const { error, value } = schema.validate(dataToValidate, {
      abortEarly: false,   // devuelve TODOS los errores, no solo el primero
      stripUnknown: true,  // elimina campos no definidos en el schema
    });

    if (error) {
      error.isJoi = true;  // flag que usa errorHandler para devolver 400
      return next(error);
    }

    if (source === 'query') {
      req.query = value; // query limpia y normalizada
    } else {
      req.body = value;  // body limpio y normalizado (trim, lowercase, etc.)
    }
    next();
  };
}

module.exports = { validate };
