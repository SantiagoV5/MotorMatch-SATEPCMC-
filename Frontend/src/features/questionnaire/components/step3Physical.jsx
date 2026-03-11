import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuestionnaire } from '../hooks/useQuestionnaire'

const HEIGHT_PRESETS = [
  { key: 'baja',  label: 'Baja',  sublabel: '< 160cm',      value: 160 },
  { key: 'media', label: 'Media', sublabel: '160cm – 175cm', value: 160 },
  { key: 'alta',  label: 'Alta',  sublabel: '> 175cm',       value: 176 },
]

// No → false, No sé → null, Sí → true
const WEIGHT_COMFORT_OPTIONS = [
  { key: 'no',    value: false, label: 'No',    sub: 'Prefiero motos ligeras y ágiles' },
  { key: 'no_se', value: null,  label: 'No sé', sub: 'No tengo experiencia con motos pesadas' },
  { key: 'si',    value: true,  label: 'Sí',    sub: 'Me siento cómodo con cualquier peso' },
]

export default function Step3Physical() {
  const { answers, updateAnswers, prevStep, totalSteps, submit, loading, error } = useQuestionnaire()
  const navigate = useNavigate()
  const heightCm = answers.heightCm || 175

  function derivePresetFromHeight(h) {
    if (h < 160) return 'baja'
    if (h <= 175) return 'media'
    return 'alta'
  }

  const [selectedPreset, setSelectedPreset] = useState(() => derivePresetFromHeight(heightCm))

  function handleHeightSlider(e) {
    const h = parseInt(e.target.value)
    updateAnswers({ heightCm: h })
    setSelectedPreset(derivePresetFromHeight(h))
  }

  function handleHeightPreset(preset) {
    updateAnswers({ heightCm: preset.value })
    setSelectedPreset(preset.key)
  }

  function getComfortKey() {
    if (answers.comfortWithHeavy === false) return 'no'
    if (answers.comfortWithHeavy === true)  return 'si'
    return 'no_se'
  }

  async function handleFinish() {
    try {
      const result = await submit()
      sessionStorage.setItem('mm_recommendations', JSON.stringify(result))
      navigate('/recommendations')
    } catch {
      // error visible en el componente
    }
  }

  const activePreset  = selectedPreset
  const activeComfort = getComfortKey()

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
        <div className="flex flex-col max-w-[800px] w-full flex-1 gap-6">

          {/* Progress */}
          <div className="flex flex-col gap-3 p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-500">Paso 3 de {totalSteps}</span>
              <span className="text-sm font-semibold text-[#FF6B35]">Características físicas</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2">
              <div className="bg-[#FF6B35] h-2 rounded-full transition-all duration-500" style={{ width: '100%' }} />
            </div>
          </div>

          {/* Estatura */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 flex flex-col gap-6">
            <div className="flex items-center gap-3 text-[#FF6B35]">
              <span className="material-symbols-outlined text-3xl">height</span>
              <h3 className="text-xl font-bold text-[#1E2A3A]">Estatura</h3>
            </div>

            {/* Valor + slider */}
            <div className="flex flex-col items-center gap-4">
              <div className="text-center">
                <span className="text-6xl font-black text-[#FF6B35]">{heightCm}</span>
                <span className="text-sm font-semibold text-slate-400 block mt-1">CENTÍMETROS</span>
              </div>
              <div className="w-full flex items-center gap-3">
                <span className="text-xs text-slate-400 whitespace-nowrap">140 CM</span>
                <input
                  type="range"
                  min={140}
                  max={200}
                  value={heightCm}
                  onChange={handleHeightSlider}
                  className="w-full h-2 rounded-full accent-[#FF6B35] cursor-pointer"
                />
                <span className="text-xs text-slate-400 whitespace-nowrap">200 CM</span>
              </div>
            </div>

            {/* Preset buttons */}
            <div className="flex justify-between gap-4">
              {HEIGHT_PRESETS.map((preset) => {
                const active = activePreset === preset.key
                return (
                  <button
                    key={preset.key}
                    onClick={() => handleHeightPreset(preset)}
                    className={`flex-1 py-4 px-4 rounded-xl border-2 transition-all flex flex-col items-center gap-1
                      ${active
                        ? 'border-[#FF6B35] bg-[#FF6B35]/5 text-[#FF6B35]'
                        : 'border-slate-100 bg-slate-50/50 text-slate-500 hover:border-[#FF6B35] hover:text-[#FF6B35]'
                      }`}
                  >
                    <span className="text-sm font-black uppercase">{preset.label}</span>
                    <span className="text-xs font-medium opacity-70">{preset.sublabel}</span>
                  </button>
                )
              })}
            </div>

            {/* Safety message */}
            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
              <span className="material-symbols-outlined text-blue-500 text-xl mt-0.5">info</span>
              <p className="text-sm text-blue-700">
                Para mayor seguridad, es importante que apoyes ambos pies en el suelo al detener la moto.
              </p>
            </div>
          </div>

          {/* Comodidad con peso */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 flex flex-col gap-6">
            <div className="flex items-center gap-3 text-[#FF6B35]">
              <span className="material-symbols-outlined text-3xl">fitness_center</span>
              <h3 className="text-xl font-bold text-[#1E2A3A]">¿Te sientes cómodo manejando una moto pesada?</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {WEIGHT_COMFORT_OPTIONS.map(opt => {
                const active = activeComfort === opt.key
                return (
                  <button
                    key={opt.key}
                    onClick={() => updateAnswers({ comfortWithHeavy: opt.value })}
                    className={`flex flex-col items-center gap-2 py-6 px-4 rounded-xl border-2 transition-all
                      ${active
                        ? 'border-[#FF6B35] bg-[#FF6B35]/5'
                        : 'border-slate-100 bg-slate-50/50 hover:border-[#FF6B35]/40'
                      }`}
                  >
                    <span className={`text-xl font-black ${active ? 'text-[#FF6B35]' : 'text-slate-700'}`}>
                      {opt.label}
                    </span>
                    <span className="text-xs text-slate-500 text-center">{opt.sub}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-600 font-medium">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 pb-8">
            <button
              onClick={prevStep}
              className="flex-1 py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-semibold hover:border-slate-400 transition-all"
            >
              ← Anterior
            </button>
            <button
              onClick={handleFinish}
              disabled={loading}
              className={`flex-1 py-3 rounded-xl font-bold text-white transition-all
                ${loading ? 'bg-slate-300 cursor-not-allowed' : 'bg-[#FF6B35] hover:bg-[#e55a25]'}`}
            >
              {loading ? 'Procesando...' : 'Ver mis recomendaciones →'}
            </button>
          </div>

        </div>
      </main>
    </div>
  )
}
