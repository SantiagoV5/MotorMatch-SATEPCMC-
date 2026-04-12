import apiClient from '../../services/apiClient'

async function trackShareUsage(payload) {
  try {
    await apiClient.post('/analytics/share', payload)
  } catch (error) {
    console.error('Error registrando analytics de compartido:', error)
  }
}

export { trackShareUsage }