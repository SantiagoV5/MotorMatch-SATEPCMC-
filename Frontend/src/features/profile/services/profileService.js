import apiClient from '../../../services/apiClient'

async function getMyProfile() {
  const { data } = await apiClient.get('/users/me')
  return data.data
}

async function updateMyProfile(payload) {
  const { data } = await apiClient.put('/users/me', payload)
  return data.data
}

async function updateMyMileage(mileage) {
  const { data } = await apiClient.patch('/users/me/mileage', { monthlyMileage: mileage })
  return data.data
}

async function getAvailableBrands() {
  const { data } = await apiClient.get('/motorcycles/brands')
  return data.data || []
}

export { getMyProfile, updateMyProfile, updateMyMileage, getAvailableBrands }