const prisma = require('../../config/database');

/**
 * Obtiene todos los favoritos del usuario actual con datos completos de cada moto
 * @param {number} userId - ID del usuario autenticado
 * @returns {Promise<Array>} Array de objetos con datos completos de motos
 */
async function getMyFavorites(userId) {
  const favorites = await prisma.favorite.findMany({
    where: { userId },
    include: {
      motorcycle: {
        select: {
          id: true,
          brand: true,
          model: true,
          year: true,
          price: true,
          engineCc: true,
          imageUrl: true,
          description: true,
          isActive: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Retornar solo los datos de las motos
  return favorites.map((fav) => ({
    id: fav.motorcycle.id,
    brand: fav.motorcycle.brand,
    model: fav.motorcycle.model,
    year: fav.motorcycle.year,
    price: fav.motorcycle.price,
    engineCc: fav.motorcycle.engineCc,
    imageUrl: fav.motorcycle.imageUrl,
    description: fav.motorcycle.description,
    isActive: fav.motorcycle.isActive,
    addedToFavoritesAt: fav.createdAt,
  }));
}

/**
 * Obtiene solo los IDs de motos favoritas del usuario (para marcar corazones en catálogo)
 * @param {number} userId - ID del usuario autenticado
 * @returns {Promise<Array>} Array de IDs de motos
 */
async function getMyFavoriteIds(userId) {
  const favorites = await prisma.favorite.findMany({
    where: { userId },
    select: { motorcycleId: true },
  });

  return favorites.map((fav) => fav.motorcycleId);
}

/**
 * Añade una moto a favoritos del usuario
 * @param {number} userId - ID del usuario autenticado
 * @param {number} motorcycleId - ID de la moto
 * @throws {Error} Si la moto no existe o ya está en favoritos
 * @returns {Promise<Object>} Datos del favorito creado
 */
async function addFavorite(userId, motorcycleId) {
  // Verificar que la moto existe
  const motorcycle = await prisma.motorcycle.findUnique({
    where: { id: parseInt(motorcycleId, 10) },
  });

  if (!motorcycle) {
    const error = new Error('La moto especificada no existe');
    error.statusCode = 404;
    throw error;
  }

  // Verificar que no ya esté en favoritos
  const existingFavorite = await prisma.favorite.findUnique({
    where: {
      unique_user_motorcycle_favorite: {
        userId,
        motorcycleId: parseInt(motorcycleId, 10),
      },
    },
  });

  if (existingFavorite) {
    const error = new Error('Esta moto ya está en tus favoritos');
    error.statusCode = 400;
    throw error;
  }

  // Crear el favorito
  const favorite = await prisma.favorite.create({
    data: {
      userId,
      motorcycleId: parseInt(motorcycleId, 10),
    },
    include: {
      motorcycle: {
        select: {
          id: true,
          brand: true,
          model: true,
          year: true,
          price: true,
          engineCc: true,
          imageUrl: true,
          description: true,
        },
      },
    },
  });

  return {
    id: favorite.motorcycle.id,
    brand: favorite.motorcycle.brand,
    model: favorite.motorcycle.model,
    year: favorite.motorcycle.year,
    price: favorite.motorcycle.price,
    engineCc: favorite.motorcycle.engineCc,
    imageUrl: favorite.motorcycle.imageUrl,
    description: favorite.motorcycle.description,
    addedToFavoritesAt: favorite.createdAt,
  };
}

/**
 * Elimina una moto de los favoritos del usuario
 * @param {number} userId - ID del usuario autenticado
 * @param {number} motorcycleId - ID de la moto
 * @throws {Error} Si el favorito no existe
 * @returns {Promise<Object>} Datos del favorito eliminado
 */
async function removeFavorite(userId, motorcycleId) {
  // Verificar que el favorito existe
  const favorite = await prisma.favorite.findUnique({
    where: {
      unique_user_motorcycle_favorite: {
        userId,
        motorcycleId: parseInt(motorcycleId, 10),
      },
    },
  });

  if (!favorite) {
    const error = new Error('Esta moto no está en tus favoritos');
    error.statusCode = 404;
    throw error;
  }

  // Eliminar el favorito
  await prisma.favorite.delete({
    where: {
      unique_user_motorcycle_favorite: {
        userId,
        motorcycleId: parseInt(motorcycleId, 10),
      },
    },
  });

  return { message: 'Moto eliminada de favoritos' };
}

/**
 * Verifica si una moto está en favoritos del usuario
 * @param {number} userId - ID del usuario autenticado
 * @param {number} motorcycleId - ID de la moto
 * @returns {Promise<boolean>} true si está en favoritos, false si no
 */
async function isFavorite(userId, motorcycleId) {
  const favorite = await prisma.favorite.findUnique({
    where: {
      unique_user_motorcycle_favorite: {
        userId,
        motorcycleId: parseInt(motorcycleId, 10),
      },
    },
  });

  return !!favorite;
}

module.exports = {
  getMyFavorites,
  getMyFavoriteIds,
  addFavorite,
  removeFavorite,
  isFavorite,
};
