import apiClient from '../../../services/apiClient';

/**
 * Obtiene todas las motocicletas con filtros opcionales
 * @param {Object} filters - Filtros (brand, minPrice, maxPrice, minCc, maxCc, limit)
 * @returns {Promise<Object>} Lista de motocicletas
 */
export async function getAllMotorcycles(filters = {}) {
  const params = new URLSearchParams();
  
  if (filters.brand)    params.append('brand',    filters.brand);
  if (filters.minPrice) params.append('minPrice', filters.minPrice);
  if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
  if (filters.minCc)    params.append('minCc',    filters.minCc);
  if (filters.maxCc)    params.append('maxCc',    filters.maxCc);
  if (filters.search)   params.append('search',   filters.search);
  if (filters.limit)    params.append('limit',     filters.limit);

  const queryString = params.toString();
  const url = queryString ? `/motorcycles?${queryString}` : '/motorcycles';
  
  const response = await apiClient.get(url);
  return response.data.data; // Extrae el array de motorcycles del wrapper
}

/**
 * Obtiene una motocicleta por ID
 * @param {number} id - ID de la motocicleta
 * @returns {Promise<Object>} Detalles de la motocicleta
 */
export async function getMotorcycleById(id) {
  const response = await apiClient.get(`/motorcycles/${id}`);
  return response.data.data; // Extrae el objeto motorcycle del wrapper
}

/**
 * Obtiene todas las marcas disponibles
 * @returns {Promise<Array>} Lista de marcas
 */
export async function getBrands() {
  const response = await apiClient.get('/motorcycles/brands');
  return response.data.data; // Extrae el array de brands del wrapper
}

// Export default object
export const motorcycleService = {
  getAllMotorcycles,
  getMotorcycleById,
  getBrands,
};

export default motorcycleService;