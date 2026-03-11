import { useState } from 'react'
import { useQuestionnaire } from '../hooks/useQuestionnaire'

const MIN_BUDGET = 3_000_000

const QUICK_CHIPS = [
  { label: '$5M',  value: 5_000_000 },
  { label: '$10M', value: 10_000_000 },
  { label: '$15M', value: 15_000_000 },
  { label: '$20M', value: 20_000_000 },
  { label: '$30M+', value: 30_000_000 },
]

function formatCOP(value) {
  if (!value) return ''
  return new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', maximumFractionDigits: 0,
  }).format(value)
}

export default function Step1Budget() {
  const { answers, updateAnswers, nextStep, totalSteps } = useQuestionnaire()
  const budget = answers.budget || 0

  const [rawInput, setRawInput] = useState(budget > 0 ? String(budget) : '')

  const isValid   = budget >= MIN_BUDGET
  const showError = budget > 0 && !isValid

  function handleInputChange(e) {
    const raw = e.target.value.replace(/\D/g, '')
    setRawInput(raw)
    updateAnswers({ budget: raw ? parseInt(raw) : 0 })
  }

  function handleChip(value) {
    setRawInput(String(value))
    updateAnswers({ budget: value })
  }

  function handleSkip() {
    setRawInput('')
    updateAnswers({ budget: 0 })
    nextStep()
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-[#F5F7FA] font-display text-slate-800">

      {/* Header */}
      <header className="flex items-center justify-between border-b border-slate-200 px-6 md:px-10 py-4 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <span className="material-symbols-outlined text-3xl text-[#FF6B35]">two_wheeler</span>
          <h2 className="text-[#1E2A3A] text-xl font-bold leading-tight tracking-tight">MotorMatch</h2>
        </div>
        <div className="hidden md:flex items-center gap-4">
          <button className="flex min-w-[120px] cursor-pointer items-center justify-center rounded-lg h-10 px-4 bg-[#1E2A3A] text-white text-sm font-bold hover:opacity-90 transition-all">
            Mi Perfil
          </button>
        </div>
      </header>

      <main className="flex flex-1 justify-center py-12 px-4 md:px-0">
        <div className="flex flex-col max-w-[800px] w-full flex-1">

          {/* Progress */}
          <div className="flex flex-col gap-3 p-6 bg-white rounded-2xl mb-8 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-500">Paso 1 de {totalSteps}</span>
              <span className="text-sm font-semibold text-[#FF6B35]">Presupuesto</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2">
              <div className="bg-[#FF6B35] h-2 rounded-full transition-all duration-500" style={{ width: `${(1 / totalSteps) * 100}%` }} />
            </div>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 flex flex-col gap-8">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3 text-[#FF6B35]">
                <span className="material-symbols-outlined text-3xl">payments</span>
                <h3 className="text-2xl font-bold text-[#1E2A3A]">¿Cuál es tu presupuesto?</h3>
              </div>
              <p className="text-slate-500 text-sm">
                Indica cuánto estás dispuesto a invertir en tu moto. El presupuesto mínimo es de {formatCOP(MIN_BUDGET)}.
              </p>
            </div>

            {/* Input */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-600">Monto en pesos colombianos (COP)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">$</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={rawInput}
                  onChange={handleInputChange}
                  placeholder="Ej: 8000000"
                  className={`w-full pl-8 pr-4 py-4 rounded-xl border-2 text-lg font-semibold transition-all outline-none
                    ${showError ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-slate-50 focus:border-[#FF6B35]'}`}
                />
              </div>
              {budget > 0 && (
                <p className="text-sm text-slate-500 font-medium">{formatCOP(budget)}</p>
              )}
              {showError && (
                <p className="text-sm text-red-500 font-medium">
                  El presupuesto mínimo es de {formatCOP(MIN_BUDGET)}
                </p>
              )}
            </div>

            {/* Quick chips */}
            <div className="flex flex-col gap-3">
              <span className="text-sm font-semibold text-slate-600">Valores frecuentes</span>
              <div className="flex flex-wrap gap-3">
                {QUICK_CHIPS.map(chip => (
                  <button
                    key={chip.value}
                    onClick={() => handleChip(chip.value)}
                    className={`px-5 py-2 rounded-full border-2 font-semibold text-sm transition-all
                      ${budget === chip.value
                        ? 'border-[#FF6B35] bg-[#FF6B35]/10 text-[#FF6B35]'
                        : 'border-slate-200 text-slate-600 hover:border-[#FF6B35] hover:text-[#FF6B35]'
                      }`}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Checkboxes */}
            <div className="flex flex-col gap-3">
              <span className="text-sm font-semibold text-slate-600">¿El presupuesto incluye?</span>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={answers.includesSoat}
                  onChange={e => updateAnswers({ includesSoat: e.target.checked })}
                  className="w-5 h-5 accent-[#FF6B35]"
                />
                <span className="text-sm text-slate-700">SOAT (Seguro Obligatorio)</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={answers.includesRegistration}
                  onChange={e => updateAnswers({ includesRegistration: e.target.checked })}
                  className="w-5 h-5 accent-[#FF6B35]"
                />
                <span className="text-sm text-slate-700">Matrícula y traspaso</span>
              </label>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <button
                onClick={handleSkip}
                className="flex-1 py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-semibold hover:border-slate-400 transition-all"
              >
                Saltar este paso
              </button>
              <button
                disabled={!isValid}
                onClick={nextStep}
                className={`flex-1 py-3 rounded-xl font-bold text-white transition-all
                  ${isValid
                    ? 'bg-[#FF6B35] hover:bg-[#e55a25]'
                    : 'bg-slate-300 cursor-not-allowed'
                  }`}
              >
                Continuar →
              </button>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}
