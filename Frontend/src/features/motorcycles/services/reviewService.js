import apiClient from '../../../services/apiClient'

async function getMotorcycleReviews(motorcycleId, params = {}) {
  const { data } = await apiClient.get('/reviews', {
    params: {
      motorcycleId,
      page: params.page || 1,
      limit: params.limit || 5,
    },
  })

  return data.data
}

async function createReview(payload) {
  const { data } = await apiClient.post('/reviews', payload)
  return data.data
}

async function updateReview(reviewId, payload) {
  const { data } = await apiClient.put(`/reviews/${reviewId}`, payload)
  return data.data
}

async function deleteReview(reviewId) {
  const { data } = await apiClient.delete(`/reviews/${reviewId}`)
  return data.data
}

export {
  getMotorcycleReviews,
  createReview,
  updateReview,
  deleteReview,
}