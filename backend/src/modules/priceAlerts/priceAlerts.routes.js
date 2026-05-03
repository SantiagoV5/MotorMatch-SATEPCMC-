const { Router } = require('express');
const { requireAuth } = require('../../middlewares/auth.middleware');
const { validate } = require('../../middlewares/validation.middleware');

const priceAlertsController = require('./priceAlerts.controller');
const { createAlertSchema, paginationSchema, updateAlertSchema } = require('./priceAlerts.validation');

const router = Router();

// Todas las rutas requieren estar logueado
router.use(requireAuth);

// ─── Historial (debe ir antes que /:id para evitar choques) ─────────────────────────
router.get('/history', validate(paginationSchema, 'query'), priceAlertsController.getHistory);

// ─── CRUD Básico ─────────────────────────────────────────────────────────────
router.post('/', validate(createAlertSchema), priceAlertsController.createAlert);

router.get('/', validate(paginationSchema, 'query'), priceAlertsController.getAlerts);

router.get('/:id', priceAlertsController.getAlertById);

router.delete('/:id', priceAlertsController.deleteAlert);

// ─── Acciones de Estado ──────────────────────────────────────────────────────
router.patch('/:id/pause', priceAlertsController.pauseAlert);

router.patch('/:id/reactivate', validate(updateAlertSchema), priceAlertsController.reactivateAlert);

module.exports = router;
