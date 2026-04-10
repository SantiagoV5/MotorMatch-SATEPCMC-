const { Router } = require('express');
const { validate } =
  require('../../middlewares/validation.middleware');
const { optionalAuth } =
  require('../../middlewares/auth.middleware');
const { requireAuth } =
  require('../../middlewares/auth.middleware');
const {
  calculate,
  save,
  getHistory,
  getById,
  remove,
  getCalculationInfoEndpoint,
} = require('./costSimulator.controller');
const { calculateSimulationSchema } =
  require('./costSimulator.validation');

const router = Router();

/**
 * GET /api/cost-simulator/info
 * Información sobre cálculos (público)
 */
router.get('/info', getCalculationInfoEndpoint);

/**
 * GET /api/cost-simulator/calculate?motorcycleId=1&soatCost=100000
 * Calcula simulación sin guardar (público, pero acepta userId de usuario autenticado)
 */
router.get('/calculate', optionalAuth, validate(calculateSimulationSchema, 'query'), calculate);

/**
 * POST /api/cost-simulator/save
 * Calcula y guarda simulación (requiere autenticación)
 */
router.post('/save', optionalAuth, validate(calculateSimulationSchema), save);

/**
 * GET /api/cost-simulator/history
 * Historial de simulaciones del usuario (requiere autenticación)
 */
router.get('/history', requireAuth, getHistory);

/**
 * GET /api/cost-simulator/:id
 * Obtiene una simulación específica (requiere autenticación)
 */
router.get('/:id', requireAuth, getById);

/**
 * DELETE /api/cost-simulator/:id
 * Elimina una simulación (requiere autenticación)
 */
router.delete('/:id', requireAuth, remove);

module.exports = router;
