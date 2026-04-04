const favoritesService = require('./favorites.service');

/**
 * GET /api/favorites
 * Obtiene todos los favoritos del usuario actual con datos completos de cada moto
 */
async function getMyFavorites(req, res, next) {
  try {
    const userId = req.user.id;
    const favorites = await favoritesService.getMyFavorites(userId);

    res.status(200).json({
      success: true,
      count: favorites.length,
      data: favorites,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/favorites/ids
 * Obtiene solo los IDs de motos favoritas (para marcar corazones en catálogo)
 */
async function getMyFavoriteIds(req, res, next) {
  try {
    const userId = req.user.id;
    const favoriteIds = await favoritesService.getMyFavoriteIds(userId);

    res.status(200).json({
      success: true,
      count: favoriteIds.length,
      data: favoriteIds,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/favorites/:motorcycleId
 * Añade una moto a favoritos
 */
async function addFavorite(req, res, next) {
  try {
    const userId = req.user.id;
    const { motorcycleId } = req.params;

    const favorite = await favoritesService.addFavorite(userId, motorcycleId);

    res.status(201).json({
      success: true,
      message: 'Moto agregada a favoritos',
      data: favorite,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/favorites/:motorcycleId
 * Elimina una moto de los favoritos
 */
async function removeFavorite(req, res, next) {
  try {
    const userId = req.user.id;
    const { motorcycleId } = req.params;

    const result = await favoritesService.removeFavorite(userId, motorcycleId);

    res.status(200).json({
      success: true,
      message: result.message,
      data: {},
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getMyFavorites,
  getMyFavoriteIds,
  addFavorite,
  removeFavorite,
};
