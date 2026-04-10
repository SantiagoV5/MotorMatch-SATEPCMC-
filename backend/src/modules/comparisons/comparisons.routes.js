const { Router } = require('express');
const { requireAuth } = require('../../middlewares/auth.middleware');
const {
  createComparison,
  listComparisons,
  removeComparison,
  clearComparisons,
} = require('./comparisons.controller');

const router = Router();
router.use(requireAuth);

// GET  /api/comparisons          → historial (20 más recientes)
router.get('/', listComparisons);

// POST /api/comparisons          → guardar comparación
router.post('/', createComparison);

// DELETE /api/comparisons        → borrar todo el historial
router.delete('/', clearComparisons);

// DELETE /api/comparisons/:id    → borrar una comparación
router.delete('/:id', removeComparison);

module.exports = router;
