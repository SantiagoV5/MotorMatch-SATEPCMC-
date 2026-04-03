import apiClient from '../../../services/apiClient';

/** Devuelve todos los favoritos del usuario con datos completos de cada moto. */
export async function getMyFavorites() {
  const { data } = await apiClient.get('/favorites');
  return data.data;
}

/** Devuelve solo los IDs de motos favoritas (para marcar corazones en catálogo). */
export async function getMyFavoriteIds() {
  const { data } = await apiClient.get('/favorites/ids');
  return data.data; // number[]
}

/** Añade una moto a favoritos. */
export async function addFavorite(motorcycleId) {
  const { data } = await apiClient.post(`/favorites/${motorcycleId}`);
  return data.data;
}

/** Elimina una moto de favoritos. */
export async function removeFavorite(motorcycleId) {
  const { data } = await apiClient.delete(`/favorites/${motorcycleId}`);
  return data.data;
}
