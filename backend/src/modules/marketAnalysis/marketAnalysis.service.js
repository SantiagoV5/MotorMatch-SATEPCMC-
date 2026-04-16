const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Obtiene las marcas más populares basadas en favoritos y recomendaciones
 */
async function getPopularBrands() {
  try {
    const brands = await prisma.$queryRaw`
      SELECT 
        m.brand,
        COUNT(DISTINCT f.id) as favorites_count,
        COUNT(DISTINCT r.id) as recommendations_count,
        COUNT(DISTINCT f.id) + COUNT(DISTINCT r.id) as total_popularity
      FROM motorcycles m
      LEFT JOIN favorites f ON m.id = f.motorcycle_id
      LEFT JOIN recommendations r ON m.id = r.motorcycle_id
      WHERE m.is_active = true
      GROUP BY m.brand
      ORDER BY total_popularity DESC
      LIMIT 5
    `;

    return brands.map(b => ({
      brand: b.brand,
      favoritesCount: Number(b.favorites_count),
      recommendationsCount: Number(b.recommendations_count),
      totalPopularity: Number(b.total_popularity),
    }));
  } catch (error) {
    console.error('Error en getPopularBrands:', error);
    throw error;
  }
}

/**
 * Obtiene precios promedio por segmento de cilindrada
 * Segmentos: Económica, Intermedia y Premium
 */
async function getSegmentPrices() {
  try {
    const segments = await prisma.$queryRaw`
      SELECT 
        CASE 
          WHEN COALESCE(engine_cc, 0) <= 250 THEN 'Económica'
          WHEN engine_cc <= 600 THEN 'Intermedia'
          ELSE 'Premium'
        END as segment,
        COUNT(*) as motorcycle_count,
        ROUND(AVG(price)::numeric, 0) as avg_price,
        MIN(price) as min_price,
        MAX(price) as max_price
      FROM motorcycles
      WHERE is_active = true AND price > 0
      GROUP BY 
        CASE 
          WHEN COALESCE(engine_cc, 0) <= 250 THEN 1
          WHEN engine_cc <= 600 THEN 2
          ELSE 3
        END,
        CASE 
          WHEN COALESCE(engine_cc, 0) <= 250 THEN 'Económica'
          WHEN engine_cc <= 600 THEN 'Intermedia'
          ELSE 'Premium'
        END
      ORDER BY 
        CASE 
          WHEN COALESCE(engine_cc, 0) <= 250 THEN 1
          WHEN engine_cc <= 600 THEN 2
          ELSE 3
        END
    `;

    return segments.map(s => ({
      segment: s.segment,
      motorcycleCount: Number(s.motorcycle_count),
      avgPrice: Number(s.avg_price),
      minPrice: Number(s.min_price),
      maxPrice: Number(s.max_price),
    }));
  } catch (error) {
    console.error('Error en getSegmentPrices:', error);
    throw error;
  }
}

/**
 * Obtiene top 5 motos más buscadas (por favoritos en últimos 30 días)
 */
async function getTopMotorcyclesList() {
  try {
    const topMotos = await prisma.$queryRaw`
      SELECT 
        m.id,
        m.brand,
        m.model,
        m.year,
        m.engine_cc,
        m.price,
        m.image_url,
        COUNT(DISTINCT f.id) as favorites_count,
        COUNT(DISTINCT r.id) as recommendations_count,
        COUNT(DISTINCT f.id) + COUNT(DISTINCT r.id) as total_searches
      FROM motorcycles m
      LEFT JOIN favorites f ON m.id = f.motorcycle_id 
        AND f.created_at >= NOW() - INTERVAL '30 days'
      LEFT JOIN recommendations r ON m.id = r.motorcycle_id 
        AND r.created_at >= NOW() - INTERVAL '30 days'
      WHERE m.is_active = true
      GROUP BY m.id, m.brand, m.model, m.year, m.engine_cc, m.price, m.image_url
      ORDER BY total_searches DESC
      LIMIT 5
    `;

    return topMotos.map(m => ({
      id: m.id,
      brand: m.brand,
      model: m.model,
      year: m.year,
      engineCc: m.engine_cc,
      price: Number(m.price),
      imageUrl: m.image_url,
      favoritesCount: Number(m.favorites_count),
      recommendationsCount: Number(m.recommendations_count),
      totalSearches: Number(m.total_searches),
    }));
  } catch (error) {
    console.error('Error en getTopMotorcyclesList:', error);
    throw error;
  }
}

module.exports = {
  getPopularBrands,
  getSegmentPrices,
  getTopMotorcyclesList,
};
