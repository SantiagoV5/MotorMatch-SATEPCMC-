/**
 * Validaciones para el módulo de favoritos
 */

/**
 * Valida que motorcycleId sea un número válido
 * @param {string|number} motorcycleId - ID de la moto
 * @throws {Error} Si no es un número válido
 */
function validateMotorcycleId(motorcycleId) {
  const id = parseInt(motorcycleId, 10);

  if (Number.isNaN(id) || id <= 0) {
    const error = new Error('El ID de la moto debe ser un número entero válido');
    error.statusCode = 400;
    throw error;
  }

  return id;
}

module.exports = {
  validateMotorcycleId,
};
