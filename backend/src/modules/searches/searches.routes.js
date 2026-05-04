const { Router } = require('express');
const { postSearch, getTopMonth } = require('./searches.controller');
const { requireAuth } = require('../../middlewares/auth.middleware');

const router = Router();

// POST /api/searches  — registra una búsqueda (requiere sesión para evitar spam anónimo)
router.post('/', requireAuth, postSearch);

// GET  /api/searches/top-month  — top motos más buscadas este mes
router.get('/top-month', requireAuth, getTopMonth);

module.exports = router;
