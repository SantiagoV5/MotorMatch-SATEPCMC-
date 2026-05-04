const { recordSearch, getTopSearchedThisMonth } = require('./searches.service');

/**
 * POST /api/searches
 * Body: { motorcycleId: number }
 * Registra una visita a la ficha técnica de una moto.
 * No requiere autenticación (se llama en cuanto se abre la ficha).
 */
async function postSearch(req, res, next) {
  try {
    const { motorcycleId } = req.body;
    if (!motorcycleId) return res.status(400).json({ message: 'motorcycleId es requerido' });
    const result = await recordSearch(motorcycleId);
    res.status(201).json({ data: result });
  } catch (err) { next(err); }
}

/**
 * GET /api/searches/top-month
 * Devuelve las motos más buscadas en el mes actual.
 * Si hay menos de 10, devuelve { data: [], insufficient: true }.
 */
async function getTopMonth(req, res, next) {
  try {
    const limit = Math.min(Number(req.query.limit) || 10, 20);
    const data  = await getTopSearchedThisMonth(limit, limit);
    res.json({
      data,
      insufficient: data.length === 0,
      month: new Date().toLocaleString('es-CO', { month: 'long', year: 'numeric' }),
    });
  } catch (err) { next(err); }
}

module.exports = { postSearch, getTopMonth };
