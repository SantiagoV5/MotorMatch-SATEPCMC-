import { useState } from 'react'
import { useQuestionnaireCtx } from '../context/questionnaireContext'
import { submitQuestionnaire } from '../services/questionnaireService'

export function useQuestionnaire() {
  const ctx = useQuestionnaireCtx()
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  async function submit() {
    setLoading(true)
    setError(null)
    try {
      const result = await submitQuestionnaire(ctx.answers)
      return result
    } catch (err) {
      // Obtener mensaje de error detallado
      let msg = 'Error al enviar el cuestionario'
      if (err.response?.data?.details && Array.isArray(err.response.data.details)) {
        // Joi devuelve un array de objetos con "message"
        msg = err.response.data.details.map(d => d.message || d).join('; ')
      } else if (err.response?.data?.message) {
        msg = err.response.data.message
      } else if (err.response?.status === 400) {
        msg = 'Datos inválidos. Verifica todos los campos.'
      } else if (err.response?.status === 401) {
        msg = 'Sesión expirada. Por favor inicia sesión nuevamente.'
      }
      
      console.error('Error enviando cuestionario:', err.response?.data || err.message)
      setError(msg)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { ...ctx, submit, loading, error }
}
