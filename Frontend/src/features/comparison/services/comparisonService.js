import apiClient from '../../../services/apiClient';

/**
 * Guarda una comparación en la base de datos.
 *
 * @param {number[]}    bikeIds        - IDs de las motos (2 o 3)
 * @param {string}      comparisonType - 'general' | 'economica' | 'potencia' | 'comodidad'
 * @param {number|null} winnerBikeId   - ID de la moto ganadora; null si hubo empate total
 */
export async function saveComparison(bikeIds, comparisonType = 'general', winnerBikeId = null) {
  const { data } = await apiClient.post('/comparisons', {
    bikeIds,
    comparisonType,
    winnerBikeId: winnerBikeId ?? null,
  });
  return data.data;
}

export async function getComparisonHistory() {
  const { data } = await apiClient.get('/comparisons');
  // Cada elemento: { id, comparisonDate, comparisonType, winnerBikeId, bikes: [...] }
  return data.data;
}

export async function deleteComparison(id) {
  const { data } = await apiClient.delete(`/comparisons/${id}`);
  return data.data;
}

export async function deleteAllComparisons() {
  const { data } = await apiClient.delete('/comparisons');
  return data.data;
}
