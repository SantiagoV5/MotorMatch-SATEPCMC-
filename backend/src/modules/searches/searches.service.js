const prisma = require('../../config/database');

/**
 * Registra una búsqueda (visita a ficha técnica) de una moto.
 *
 * Tabla requerida en Supabase (crear con el SQL del README):
 *   CREATE TABLE IF NOT EXISTS motorcycle_searches (
 *     id           SERIAL PRIMARY KEY,
 *     motorcycle_id INTEGER NOT NULL REFERENCES motorcycles(id) ON DELETE CASCADE,
 *     searched_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
 *   );
 *   CREATE INDEX IF NOT EXISTS idx_searches_motorcycle ON motorcycle_searches(motorcycle_id);
 *   CREATE INDEX IF NOT EXISTS idx_searches_date       ON motorcycle_searches(searched_at);
 *
 * @param {number} motorcycleId
 */
async function recordSearch(motorcycleId) {
  const id = Number(motorcycleId);
  if (!id || isNaN(id)) throw Object.assign(new Error('motorcycleId inválido'), { statusCode: 400 });

  await prisma.$executeRaw`
    INSERT INTO motorcycle_searches (motorcycle_id, searched_at)
    VALUES (${id}, NOW())
  `;
  return { recorded: true };
}

/**
 * Devuelve el conteo de búsquedas del mes en curso para una moto.
 * "Mes en curso" = desde el primer día del mes actual hasta ahora.
 *
 * @param {number} motorcycleId
 */
async function getMonthlySearchCount(motorcycleId) {
  const id = Number(motorcycleId);
  const rows = await prisma.$queryRaw`
    SELECT COUNT(*)::int AS total
    FROM motorcycle_searches
    WHERE motorcycle_id = ${id}
      AND searched_at >= DATE_TRUNC('month', NOW())
  `;
  return Number(rows[0]?.total ?? 0);
}

/**
 * Devuelve las N motos con más búsquedas en el mes en curso.
 * Solo incluye motos con al menos 1 búsqueda este mes.
 * Si hay menos de `minRequired` motos, devuelve un array vacío
 * para que el frontend muestre el mensaje de "datos insuficientes".
 *
 * @param {number} limit        - Máximo de resultados (default 10)
 * @param {number} minRequired  - Mínimo para mostrar la tabla (default 10)
 */
async function getTopSearchedThisMonth(limit = 10, minRequired = 10) {
  const rows = await prisma.$queryRaw`
    SELECT
      m.id,
      m.brand,
      m.model,
      m.year,
      m.engine_cc,
      m.price,
      m.image_url,
      COUNT(ms.id)::int                          AS monthly_searches,
      COUNT(DISTINCT f.id)::int                  AS favorites_count
    FROM motorcycles m
    JOIN motorcycle_searches ms
      ON ms.motorcycle_id = m.id
      AND ms.searched_at >= DATE_TRUNC('month', NOW())
    LEFT JOIN favorites f ON f.motorcycle_id = m.id
    WHERE m.is_active = true
    GROUP BY m.id, m.brand, m.model, m.year, m.engine_cc, m.price, m.image_url
    ORDER BY monthly_searches DESC
    LIMIT ${limit}
  `;

  // Si no hay suficientes datos, devolvemos array vacío → frontend muestra aviso
  if (rows.length < minRequired) return [];

  const formatCOP = n => new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', maximumFractionDigits: 0,
  }).format(Number(n));

  return rows.map((r, i) => ({
    rank:           i + 1,
    id:             Number(r.id),
    brand:          r.brand,
    model:          r.model,
    year:           r.year,
    engineCc:       r.engine_cc,
    price:          Number(r.price),
    priceFormatted: formatCOP(r.price),
    imageUrl:       r.image_url,
    monthlySearches: Number(r.monthly_searches),
    favoritesCount:  Number(r.favorites_count),
  }));
}

module.exports = { recordSearch, getMonthlySearchCount, getTopSearchedThisMonth };
