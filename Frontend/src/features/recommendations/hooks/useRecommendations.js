import { useState, useEffect } from 'react'
import apiClient from '../../../services/apiClient'

function warmRecommendationHeroImage(imageUrl) {
  if (typeof document === 'undefined' || !imageUrl) return

  const existingPreload = document.head.querySelector(`link[data-mm-recommendation-hero="${imageUrl}"]`)
  if (!existingPreload) {
    const preloadLink = document.createElement('link')
    preloadLink.rel = 'preload'
    preloadLink.as = 'image'
    preloadLink.href = imageUrl
    preloadLink.setAttribute('data-mm-recommendation-hero', imageUrl)
    preloadLink.crossOrigin = 'anonymous'
    document.head.appendChild(preloadLink)
  }

  const image = new Image()
  image.decoding = 'async'
  image.fetchPriority = 'high'
  image.src = imageUrl
}

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
          warmRecommendationHeroImage(parsed.recommendations[0]?.motorcycle?.imageUrl)
          // questionnaire object has id, budget, usageType, heightCm
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
      warmRecommendationHeroImage(data.recommendations?.[0]?.motorcycle?.imageUrl)
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
