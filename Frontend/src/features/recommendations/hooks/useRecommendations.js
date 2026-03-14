import { useState, useEffect } from 'react'
import apiClient from '../../../services/apiClient'

export function useRecommendations() {
  const [recommendations, setRecommendations] = useState([])
  const [questionnaire, setQuestionnaire]     = useState(null)
  const [loading, setLoading]                 = useState(true)
  const [error, setError]                     = useState(null)

  useEffect(() => {
    // Try sessionStorage first (populated right after submitting the questionnaire)
    const cached = sessionStorage.getItem('mm_recommendations')
    if (cached) {
      try {
        const parsed = JSON.parse(cached)
        // Shape from submitQuestionnaire: { questionnaire, recommendations }
        if (parsed.recommendations) {
          setRecommendations(parsed.recommendations)
          // questionnaire object has budget, usageType, heightCm
          setQuestionnaire(parsed.questionnaire || null)
          setLoading(false)
          return
        }
      } catch {
        sessionStorage.removeItem('mm_recommendations')
      }
    }
    fetchFromBackend()
  }, [])

  async function fetchFromBackend() {
    try {
      setLoading(true)
      const { data } = await apiClient.get('/questionnaire/my/recommendations')
      setRecommendations(data.recommendations || [])
      setQuestionnaire(data.questionnaire || null)
    } catch (err) {
      setError('No se pudieron cargar las recomendaciones')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return { recommendations, questionnaire, loading, error, refetch: fetchFromBackend }
}
