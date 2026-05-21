import apiClient from '../../../services/apiClient'

export async function getDealershipsByMotorcycle(motorcycleId, options = {}) {
  const params = new URLSearchParams()

  if (options.lat !== undefined && options.lng !== undefined) {
    params.append('lat', options.lat)
    params.append('lng', options.lng)
  }

  if (options.limit) params.append('limit', options.limit)

  const query = params.toString()
  const { data } = await apiClient.get(`/dealerships/motorcycles/${motorcycleId}${query ? `?${query}` : ''}`)
  return data
}
