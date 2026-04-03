import apiClient from '../../../services/apiClient';

export async function saveComparison(bikeIds) {
  const { data } = await apiClient.post('/comparisons', { bikeIds });
  return data.data;
}
