import apiClient from '../../../services/apiClient';

export async function saveComparison(bikeIds) {
  const { data } = await apiClient.post('/comparisons', { bikeIds });
  return data.data;
}

export async function getComparisonHistory() {
  const { data } = await apiClient.get('/comparisons');
  return data.data; // array of { id, comparisonDate, bikes: [{id,brand,model,imageUrl,engineCc}] }
}

export async function deleteComparison(id) {
  const { data } = await apiClient.delete(`/comparisons/${id}`);
  return data.data;
}

export async function deleteAllComparisons() {
  const { data } = await apiClient.delete('/comparisons');
  return data.data;
}
