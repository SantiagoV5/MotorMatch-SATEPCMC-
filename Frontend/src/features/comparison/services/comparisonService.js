import apiClient from '../../../services/apiClient';

/**
 * Guarda una comparación en la base de datos.
 *
 * [MODIFICADO] Ahora acepta y envía el tipo de comparación al backend.
 * @param {number[]} bikeIds - IDs de las motos (2 o 3)
 * @param {string} comparisonType - Tipo: 'general' | 'economica' | 'potencia' | 'comodidad'
 */
export async function saveComparison(bikeIds, comparisonType = 'general') {
  const { data } = await apiClient.post('/comparisons', { bikeIds, comparisonType });
  return data.data;
}

export async function getComparisonHistory() {
  const { data } = await apiClient.get('/comparisons');
  return data.data; // array de { id, comparisonDate, comparisonType, bikes: [{id,brand,model,imageUrl,engineCc}] }
}

export async function deleteComparison(id) {
  const { data } = await apiClient.delete(`/comparisons/${id}`);
  return data.data;
}

export async function deleteAllComparisons() {
  const { data } = await apiClient.delete('/comparisons');
  return data.data;
}
