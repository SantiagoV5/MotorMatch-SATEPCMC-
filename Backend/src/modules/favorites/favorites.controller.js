const {
  getFavoritesByUser,
  addFavorite,
  removeFavorite,
  getFavoriteIds,
} = require('./favorites.service');

// GET /api/favorites
async function listFavorites(req, res, next) {
  try {
    const favorites = await getFavoritesByUser(req.user.id);
    res.json({ data: favorites });
  } catch (err) {
    next(err);
  }
}

// GET /api/favorites/ids
async function listFavoriteIds(req, res, next) {
  try {
    const ids = await getFavoriteIds(req.user.id);
    res.json({ data: ids });
  } catch (err) {
    next(err);
  }
}

// POST /api/favorites/:motorcycleId
async function addToFavorites(req, res, next) {
  try {
    const favorite = await addFavorite(req.user.id, req.params.motorcycleId);
    res.status(201).json({ data: favorite });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/favorites/:motorcycleId
async function removeFromFavorites(req, res, next) {
  try {
    const result = await removeFavorite(req.user.id, req.params.motorcycleId);
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
}

module.exports = { listFavorites, listFavoriteIds, addToFavorites, removeFromFavorites };
