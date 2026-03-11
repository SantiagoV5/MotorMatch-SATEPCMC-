import { QuestionnaireProvider, useQuestionnaireCtx } from '../context/questionnaireContext'
import Step1Budget   from './step1Budget'
import Step2Usage    from './step2Usage'
import Step3Physical from './step3Physical'

function WizardContent() {
  const { step } = useQuestionnaireCtx()
  if (step === 1) return <Step1Budget />
  if (step === 2) return <Step2Usage />
  return <Step3Physical />
}

export default function QuestionnaireWizard() {
  return (
    <QuestionnaireProvider>
      <WizardContent />
    </QuestionnaireProvider>
  )
}
