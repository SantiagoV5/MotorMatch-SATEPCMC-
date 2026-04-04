const { Router } = require('express');
const { requireAuth } = require('../../middlewares/auth.middleware');
const {
  getMyFavorites,
  getMyFavoriteIds,
  addFavorite,
  removeFavorite,
} = require('./favorites.controller');

const router = Router();

// Todas las rutas de favoritos requieren autenticación
router.use(requireAuth);

// GET /api/favorites/ids - Debe ir antes de /:id
router.get('/ids', getMyFavoriteIds);

// GET /api/favorites - Obtiene todos los favoritos del usuario con datos completos
router.get('/', getMyFavorites);

// POST /api/favorites/:motorcycleId - Añade una moto a favoritos
router.post('/:motorcycleId', addFavorite);

// DELETE /api/favorites/:motorcycleId - Elimina una moto de favoritos
router.delete('/:motorcycleId', removeFavorite);

module.exports = router;
