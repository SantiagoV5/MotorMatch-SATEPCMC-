import { createContext, useContext, useState } from 'react'

const QuestionnaireContext = createContext(null)

const initialAnswers = {
  budget: 0,
  includesSoat: false,
  includesRegistration: false,
  usageType: '',
  frequency: '',
  hasPassenger: false,
  passengerFrequency: '',
  heightCm: 175,
  weightKg: null,
  comfortWithHeavy: null,
}

export function QuestionnaireProvider({ children }) {
  const [step, setStep] = useState(1)
  const [answers, setAnswers] = useState(initialAnswers)
  const totalSteps = 3

  function updateAnswers(partial) {
    setAnswers(prev => ({ ...prev, ...partial }))
  }

  function nextStep() {
    setStep(s => Math.min(s + 1, totalSteps))
  }

  function prevStep() {
    setStep(s => Math.max(s - 1, 1))
  }

  function resetQuestionnaire() {
    setStep(1)
    setAnswers(initialAnswers)
  }

  return (
    <QuestionnaireContext.Provider
      value={{ step, totalSteps, answers, updateAnswers, nextStep, prevStep, resetQuestionnaire }}
    >
      {children}
    </QuestionnaireContext.Provider>
  )
}

export function useQuestionnaireCtx() {
  const ctx = useContext(QuestionnaireContext)
  if (!ctx) throw new Error('useQuestionnaireCtx must be used within QuestionnaireProvider')
  return ctx
}
