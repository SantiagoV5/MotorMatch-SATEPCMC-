const { Router } = require('express');
const {
  getBrands,
  getSegments,
  getTopMotorcycles,
  getSummary,
} = require('./marketAnalysis.controller');

const router = Router();

/**
 * GET /api/market-analysis/brands
 * Marcas más populares
 */
router.get('/brands', getBrands);

/**
 * GET /api/market-analysis/segments
 * Precios promedio por segmento
 */
router.get('/segments', getSegments);

/**
 * GET /api/market-analysis/top-motorcycles
 * Top 5 motos más buscadas
 */
router.get('/top-motorcycles', getTopMotorcycles);

/**
 * GET /api/market-analysis/summary
 * Resumen completo del análisis
 */
router.get('/summary', getSummary);

module.exports = router;
