/**
 * ai.routes.js
 * Rutas del módulo de IA — sigue el mismo patrón que el resto de módulos.
 */

const { Router } = require('express');
const { requireAuth } = require('../../middlewares/auth.middleware');
const { chat } = require('./ai.controller');

const router = Router();

// Todas las rutas de IA requieren autenticación
router.use(requireAuth);

// POST /api/ai/chat  →  enviar mensaje al modelo
router.post('/chat', chat);

module.exports = router;
