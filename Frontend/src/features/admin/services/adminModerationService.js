import apiClient from '../../../services/apiClient'

async function getAdminStats() {
  const { data } = await apiClient.get('/admin/stats')
  return data.data
}

async function getAdminReviews(params = {}) {
  const { data } = await apiClient.get('/admin/reviews', { params })
  return data.data
}

async function toggleReviewVisibility(reviewId) {
  const { data } = await apiClient.patch(`/admin/reviews/${reviewId}/toggle-visibility`)
  return data.data
}

async function deleteReview(reviewId) {
  const { data } = await apiClient.delete(`/admin/reviews/${reviewId}`)
  return data.data
}

async function getAdminUsers(params = {}) {
  const { data } = await apiClient.get('/admin/users', { params })
  return data.data
}

async function toggleUserStatus(userId) {
  const { data } = await apiClient.patch(`/admin/users/${userId}/toggle-status`)
  return data.data
}

export {
  getAdminStats,
  getAdminReviews,
  toggleReviewVisibility,
  deleteReview,
  getAdminUsers,
  toggleUserStatus,
}