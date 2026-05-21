import apiClient from '../../../services/apiClient'

export async function getAdminDealerships(filters = {}) {
  const params = new URLSearchParams()

  if (filters.search) params.append('search', filters.search)
  if (filters.brand) params.append('brand', filters.brand)
  if (filters.status) params.append('status', filters.status)
  if (filters.page) params.append('page', filters.page)
  if (filters.limit) params.append('limit', filters.limit)

  const query = params.toString()
  const { data } = await apiClient.get(`/admin/dealerships${query ? `?${query}` : ''}`)
  return data
}

export async function createAdminDealership(payload) {
  const { data } = await apiClient.post('/admin/dealerships', payload)
  return data.data
}

export async function updateAdminDealership(id, payload) {
  const { data } = await apiClient.patch(`/admin/dealerships/${id}`, payload)
  return data.data
}

export async function deactivateAdminDealership(id) {
  const { data } = await apiClient.delete(`/admin/dealerships/${id}`)
  return data.data
}
