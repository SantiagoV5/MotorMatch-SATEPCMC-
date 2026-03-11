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
      const msg =
        err.response?.data?.details?.[0] ||
        err.response?.data?.message ||
        'Error al enviar el cuestionario'
      setError(msg)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { ...ctx, submit, loading, error }
}
