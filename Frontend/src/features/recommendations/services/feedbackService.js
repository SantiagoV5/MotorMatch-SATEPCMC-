import apiClient from '../../../services/apiClient'

async function getMyFeedback(questionnaireId) {
  const { data } = await apiClient.get('/feedback/my', {
    params: { questionnaireId },
  })
  return data.data
}

async function createFeedback(payload) {
  const { data } = await apiClient.post('/feedback', payload)
  return data
}

export { getMyFeedback, createFeedback }