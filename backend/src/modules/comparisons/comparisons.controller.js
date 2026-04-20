const {
  saveComparison,
  getComparisonHistory,
  deleteComparison,
  deleteAllComparisons,
} = require('./comparisons.service');

// POST /api/comparisons
async function createComparison(req, res, next) {
  try {
    const { bikeIds, comparisonType, winnerBikeId } = req.body;
    if (!Array.isArray(bikeIds) || bikeIds.length < 2 || bikeIds.length > 3) {
      return res.status(400).json({ message: 'Se requieren entre 2 y 3 motos para comparar.' });
    }
    // winnerBikeId puede ser null (empate) o un número válido
    const result = await saveComparison(
      req.user.id,
      bikeIds,
      comparisonType  || 'general',
      winnerBikeId    ?? null,
    );
    res.status(201).json({ data: result });
  } catch (err) { next(err); }
}

// GET /api/comparisons
async function listComparisons(req, res, next) {
  try {
    const history = await getComparisonHistory(req.user.id);
    res.json({ data: history });
  } catch (err) { next(err); }
}

// DELETE /api/comparisons/:id
async function removeComparison(req, res, next) {
  try {
    const result = await deleteComparison(req.user.id, req.params.id);
    res.json({ data: result });
  } catch (err) { next(err); }
}

// DELETE /api/comparisons
async function clearComparisons(req, res, next) {
  try {
    const result = await deleteAllComparisons(req.user.id);
    res.json({ data: result });
  } catch (err) { next(err); }
}

module.exports = { createComparison, listComparisons, removeComparison, clearComparisons };
