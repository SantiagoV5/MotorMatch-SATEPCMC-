import apiClient from '../../../services/apiClient'

function buildMotorcycleFormData(form) {
  return {
    ...form,
    advantages: Array.isArray(form.advantages) ? form.advantages : [],
    disadvantages: Array.isArray(form.disadvantages) ? form.disadvantages : [],
    galleryImages: Array.isArray(form.galleryImages) ? form.galleryImages : [],
    colors: Array.isArray(form.colors) ? form.colors : [],
    referencesYT: form.referencesYT ?? null,
    externalIds: form.externalIds ?? null,
  }
}

export async function getAdminMotorcycles() {
  const { data } = await apiClient.get('/admin/motorcycles')
  return data.data || []
}

export async function getAdminMotorcycle(id) {
  const { data } = await apiClient.get(`/admin/motorcycles/${id}`)
  return data.data
}

export async function createAdminMotorcycle(form) {
  const { data } = await apiClient.post('/admin/motorcycles', buildMotorcycleFormData(form))
  return data.data
}

export async function updateAdminMotorcycle(id, form) {
  const { data } = await apiClient.put(`/admin/motorcycles/${id}`, buildMotorcycleFormData(form))
  return data.data
}

export async function toggleAdminMotorcycleStatus(id) {
  const { data } = await apiClient.patch(`/admin/motorcycles/${id}/toggle-status`)
  return data.data
}

export async function deleteAdminMotorcycle(id) {
  const { data } = await apiClient.delete(`/admin/motorcycles/${id}`)
  return data
}
