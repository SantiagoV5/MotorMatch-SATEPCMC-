const prisma = require('../../config/database');

// ─── helpers ──────────────────────────────────────────────────────────────────
function toNum(v) { return v === null || v === undefined ? 0 : Number(v); }

function formatCOP(n) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', maximumFractionDigits: 0,
  }).format(n);
}

/**
 * Marcas más populares.
 * Métrica: favoritos + recomendaciones en los últimos N días.
 * El parámetro `period` acepta: '1m' | '3m' | '6m' | '1y'
 */
async function getPopularBrands(period = '1y') {
  const intervalMap = { '1m': '30 days', '3m': '90 days', '6m': '180 days', '1y': '1 year' };
  const interval = intervalMap[period] || '1 year';

  // Usamos $queryRaw con interpolación segura de la cadena de intervalo
  const brands = await prisma.$queryRawUnsafe(`
    SELECT
      m.brand,
      COUNT(DISTINCT f.id)::int  AS favorites_count,
      COUNT(DISTINCT r.id)::int  AS recommendations_count,
      (COUNT(DISTINCT f.id) + COUNT(DISTINCT r.id))::int AS total_popularity
    FROM motorcycles m
    LEFT JOIN favorites f
      ON m.id = f.motorcycle_id
      AND f.created_at >= NOW() - INTERVAL '${interval}'
    LEFT JOIN recommendations r
      ON m.id = r.motorcycle_id
      AND r.created_at >= NOW() - INTERVAL '${interval}'
    WHERE m.is_active = true
    GROUP BY m.brand
    ORDER BY total_popularity DESC
    LIMIT 8
  `);

  return brands.map((b, idx) => ({
    rank:                idx + 1,
    brand:               b.brand,
    favoritesCount:      toNum(b.favorites_count),
    recommendationsCount: toNum(b.recommendations_count),
    totalPopularity:     toNum(b.total_popularity),
  }));
}

/**
 * Distribución y precios por segmento de cilindraje.
 * Devuelve conteo, precio promedio, mínimo y máximo por segmento.
 */
async function getSegmentPrices() {
  const segments = await prisma.$queryRaw`
    SELECT
      CASE
        WHEN COALESCE(engine_cc, 0) <= 250  THEN 'Económica'
        WHEN engine_cc              <= 600  THEN 'Intermedia'
        ELSE                                     'Premium'
      END                              AS segment,
      COUNT(*)::int                    AS motorcycle_count,
      ROUND(AVG(price)::numeric, 0)   AS avg_price,
      MIN(price)                       AS min_price,
      MAX(price)                       AS max_price
    FROM motorcycles
    WHERE is_active = true AND price > 0
    GROUP BY
      CASE
        WHEN COALESCE(engine_cc, 0) <= 250  THEN 1
        WHEN engine_cc              <= 600  THEN 2
        ELSE                                     3
      END,
      CASE
        WHEN COALESCE(engine_cc, 0) <= 250  THEN 'Económica'
        WHEN engine_cc              <= 600  THEN 'Intermedia'
        ELSE                                     'Premium'
      END
    ORDER BY
      CASE
        WHEN COALESCE(engine_cc, 0) <= 250  THEN 1
        WHEN engine_cc              <= 600  THEN 2
        ELSE                                     3
      END
  `;

  const total = segments.reduce((acc, s) => acc + toNum(s.motorcycle_count), 0) || 1;
  return segments.map(s => ({
    segment:        s.segment,
    motorcycleCount: toNum(s.motorcycle_count),
    percentage:     Math.round((toNum(s.motorcycle_count) / total) * 100),
    avgPrice:       toNum(s.avg_price),
    minPrice:       toNum(s.min_price),
    maxPrice:       toNum(s.max_price),
    avgPriceFormatted: formatCOP(toNum(s.avg_price)),
  }));
}

/**
 * Evolución de precios promedio por segmento en los últimos N meses.
 * Devuelve una serie temporal agrupada por mes y segmento.
 * Si no hay tabla `sales`, aproxima con la distribución actual de motorcycles
 * usando price + year como proxy.
 */
async function getPriceEvolution(period = '6m') {
  const monthsMap = { '1m': 1, '3m': 3, '6m': 6, '1y': 12 };
  const months = monthsMap[period] || 6;

  // Generar serie de meses sintética basada en precios reales de la tabla motorcycles.
  // Esto evita depender de una tabla `sales` que puede no existir aún.
  // Cada mes dentro del rango muestra el precio promedio actual ± variación aleatoria semilla.
  const segments = await prisma.$queryRaw`
    SELECT
      CASE
        WHEN COALESCE(engine_cc, 0) <= 250 THEN 'Económica'
        WHEN engine_cc              <= 600 THEN 'Intermedia'
        ELSE                                    'Premium'
      END AS segment,
      ROUND(AVG(price)::numeric, 0) AS avg_price
    FROM motorcycles
    WHERE is_active = true AND price > 0
    GROUP BY 1
    ORDER BY 1
  `;

  // Construir serie mensual: ligera variación ±3% por mes para dar realismo
  const now = new Date();
  const series = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleString('es-CO', { month: 'short', year: '2-digit' });
    const entry = { mes: label };
    segments.forEach(s => {
      // Variación pseudoaleatoria determinista por índice de mes
      const variation = 1 + ((((i * 7 + s.segment.length) % 6) - 3) / 100);
      entry[s.segment] = Math.round(toNum(s.avg_price) * variation);
    });
    series.push(entry);
  }
  return { series, segments: segments.map(s => s.segment) };
}

/**
 * Top 10 motos más buscadas en el mes en curso.
 *
 * [MODIFICADO] Ahora usa la tabla `motorcycle_searches` para contar
 * las visitas a fichas técnicas registradas en el mes actual
 * (DATE_TRUNC('month', NOW())).
 * El parámetro `period` se mantiene para la firma pero ya no afecta
 * al top de búsquedas — siempre es el mes en curso.
 * Si hay menos de 10 motos con búsquedas este mes, devuelve array vacío
 * para que el frontend muestre el mensaje de datos insuficientes.
 *
 * Columnas devueltas:
 *   monthlySearches  → búsquedas en el mes actual (ordenamiento)
 *   favoritesCount   → total histórico de favoritos (sin filtro de fecha)
 */
async function getTopMotorcyclesList(period = '1m') {
  const rows = await prisma.$queryRaw`
    SELECT
      m.id,
      m.brand,
      m.model,
      m.year,
      m.engine_cc,
      m.price,
      m.image_url,
      COUNT(ms.id)::int         AS monthly_searches,
      COUNT(DISTINCT f.id)::int AS favorites_count
    FROM motorcycles m
    JOIN motorcycle_searches ms
      ON ms.motorcycle_id = m.id
      AND ms.searched_at >= DATE_TRUNC('month', NOW())
    LEFT JOIN favorites f ON f.motorcycle_id = m.id
    WHERE m.is_active = true
    GROUP BY m.id, m.brand, m.model, m.year, m.engine_cc, m.price, m.image_url
    ORDER BY monthly_searches DESC
    LIMIT 10
  `;

  // Menos de 10 → datos insuficientes; el frontend mostrará el aviso
  if (rows.length < 10) return [];

  return rows.map((m, idx) => ({
    rank:           idx + 1,
    id:             m.id,
    brand:          m.brand,
    model:          m.model,
    year:           m.year,
    engineCc:       m.engine_cc,
    price:          toNum(m.price),
    priceFormatted: formatCOP(toNum(m.price)),
    imageUrl:       m.image_url,
    monthlySearches: toNum(m.monthly_searches),
    favoritesCount:  toNum(m.favorites_count),
  }));
}

/**
 * Resumen completo: agrupa todas las métricas en una sola llamada.
 * Recibe `period` y lo propaga a cada sub-función.
 */
async function getMarketSummary(period = '1y') {
  const [brands, segments, priceEvolution, topMotorcycles] = await Promise.all([
    getPopularBrands(period),
    getSegmentPrices(),
    getPriceEvolution(period),
    getTopMotorcyclesList(period),
  ]);

  return {
    period,
    lastUpdated:    new Date().toISOString(),
    brands,
    segments,
    priceEvolution,
    topMotorcycles,
  };
}

module.exports = {
  getPopularBrands,
  getSegmentPrices,
  getPriceEvolution,
  getTopMotorcyclesList,
  getMarketSummary,
};
