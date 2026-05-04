const { Router } = require('express');
const {
  getBrands,
  getSegments,
  getPrices,
  getTopMotorcycles,
  getSummary,
} = require('./marketAnalysis.controller');

const router = Router();

// GET /api/market-analysis/brands?period=1y
router.get('/brands', getBrands);

// GET /api/market-analysis/segments
router.get('/segments', getSegments);

// GET /api/market-analysis/prices?period=6m
router.get('/prices', getPrices);

// GET /api/market-analysis/top-searches?period=1m
router.get('/top-searches', getTopMotorcycles);

// GET /api/market-analysis/top-motorcycles  (alias para retrocompatibilidad)
router.get('/top-motorcycles', getTopMotorcycles);

// GET /api/market-analysis/summary?period=1y
router.get('/summary', getSummary);

module.exports = router;
