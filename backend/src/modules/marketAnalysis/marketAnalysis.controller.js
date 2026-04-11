const {
  getPopularBrands,
  getSegmentPrices,
  getTopMotorcyclesList,
} = require('./marketAnalysis.service');

/**
 * GET /api/market-analysis/brands
 * Obtiene las marcas más populares
 */
async function getBrands(req, res, next) {
  try {
    const brands = await getPopularBrands();
    res.json({
      success: true,
      data: brands,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/market-analysis/segments
 * Obtiene precios promedio por segmento
 */
async function getSegments(req, res, next) {
  try {
    const segments = await getSegmentPrices();
    res.json({
      success: true,
      data: segments,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/market-analysis/top-motorcycles
 * Obtiene top 5 motos más buscadas
 */
async function getTopMotorcycles(req, res, next) {
  try {
    const topMotos = await getTopMotorcyclesList();
    res.json({
      success: true,
      data: topMotos,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/market-analysis/summary
 * Obtiene resumen completo de análisis
 */
async function getSummary(req, res, next) {
  try {
    const [brands, segments, topMotos] = await Promise.all([
      getPopularBrands(),
      getSegmentPrices(),
      getTopMotorcyclesList(),
    ]);

    res.json({
      success: true,
      data: {
        brands,
        segments,
        topMotorcycles: topMotos,
        lastUpdated: new Date(),
      },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getBrands,
  getSegments,
  getTopMotorcycles,
  getSummary,
};
