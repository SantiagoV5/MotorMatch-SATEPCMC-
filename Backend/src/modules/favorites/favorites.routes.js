const { Router } = require('express');
const { requireAuth } = require('../../middlewares/auth.middleware');
const {
  listFavorites,
  listFavoriteIds,
  addToFavorites,
  removeFromFavorites,
} = require('./favorites.controller');

const router = Router();

// Todas las rutas de favoritos requieren autenticación
router.use(requireAuth);

// GET  /api/favorites        → lista completa con datos de moto
router.get('/', listFavorites);

// GET  /api/favorites/ids    → solo los IDs (para marcar corazones en catálogo)
router.get('/ids', listFavoriteIds);

// POST /api/favorites/:motorcycleId   → añadir favorito
router.post('/:motorcycleId', addToFavorites);

// DELETE /api/favorites/:motorcycleId → eliminar favorito
router.delete('/:motorcycleId', removeFromFavorites);

module.exports = router;
