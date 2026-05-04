const {
  getPopularBrands,
  getSegmentPrices,
  getPriceEvolution,
  getTopMotorcyclesList,
  getMarketSummary,
} = require('./marketAnalysis.service');

// Períodos válidos para evitar inyección
const VALID_PERIODS = ['1m', '3m', '6m', '1y'];
function safePeriod(raw, fallback = '1y') {
  return VALID_PERIODS.includes(raw) ? raw : fallback;
}

// GET /api/market-analysis/brands?period=1y
async function getBrands(req, res, next) {
  try {
    const period = safePeriod(req.query.period);
    const data   = await getPopularBrands(period);
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

// GET /api/market-analysis/segments
async function getSegments(req, res, next) {
  try {
    const data = await getSegmentPrices();
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

// GET /api/market-analysis/prices?period=6m
async function getPrices(req, res, next) {
  try {
    const period = safePeriod(req.query.period, '6m');
    const data   = await getPriceEvolution(period);
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

// GET /api/market-analysis/top-searches?period=1m
async function getTopMotorcycles(req, res, next) {
  try {
    const period = safePeriod(req.query.period, '1m');
    const data   = await getTopMotorcyclesList(period);
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

// GET /api/market-analysis/summary?period=1y
async function getSummary(req, res, next) {
  try {
    const period = safePeriod(req.query.period);
    const data   = await getMarketSummary(period);
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

module.exports = { getBrands, getSegments, getPrices, getTopMotorcycles, getSummary };
