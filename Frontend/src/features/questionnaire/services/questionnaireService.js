import apiClient from '../../../services/apiClient'

async function submitQuestionnaire(answers) {
  const { data } = await apiClient.post('/questionnaire', answers)
  return data  // { questionnaire, recommendations }
}

export { submitQuestionnaire }
