import apiClient from '../../../services/apiClient'

async function submitQuestionnaire(answers) {
  const { data } = await apiClient.post('/questionnaire', answers, {
    timeout: 30000,
  })
  return data  // { questionnaire, recommendations }
}

async function checkMyQuestionnaire() {
  const { data } = await apiClient.get('/questionnaire/my')
  return data
}

export { submitQuestionnaire, checkMyQuestionnaire }