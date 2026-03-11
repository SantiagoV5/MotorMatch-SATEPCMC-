import { useQuestionnaire } from '../hooks/useQuestionnaire'

const USAGE_TYPES = [
  {
    key: 'ciudad',
    icon: 'location_city',
    label: 'Ciudad',
    desc: 'Tráfico urbano, distancias cortas, semáforos',
    tooltip: 'Ideal para motos ligeras de bajo cilindraje',
  },
  {
    key: 'carretera',
    icon: 'route',
    label: 'Carretera',
    desc: 'Viajes largos, autopistas, velocidades sostenidas',
    tooltip: 'Se recomienda cilindraje mayor a 150cc',
  },
  {
    key: 'trabajo',
    icon: 'work',
    label: 'Trabajo',
    desc: 'Mensajería, domicilios, uso laboral diario',
    tooltip: 'Consumo eficiente y bajo costo de mantenimiento',
  },
  {
    key: 'offroad',
    icon: 'forest',
    label: 'Off-Road',
    desc: 'Trochas, caminos de tierra, terreno irregular',
    tooltip: 'Motos enduro o trail con suspensión reforzada',
  },
  {
    key: 'deporte',
    icon: 'sports_motorsports',
    label: 'Deporte',
    desc: 'Velocidad, adrenalina, circuitos o curvas',
    tooltip: 'Alto cilindraje y gran relación potencia/peso',
  },
]

const FREQUENCIES = [
  { value: 'diario',        label: 'Todos los días' },
  { value: 'semanal',       label: 'Varias veces a la semana' },
  { value: 'fines_de_semana', label: 'Solo fines de semana' },
  { value: 'ocasional',    label: 'Ocasionalmente' },
]

export default function Step2Usage() {
  const { answers, updateAnswers, nextStep, prevStep, totalSteps } = useQuestionnaire()

  const canContinue = !!answers.usageType

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
              <span className="text-sm font-semibold text-slate-500">Paso 2 de {totalSteps}</span>
              <span className="text-sm font-semibold text-[#FF6B35]">Uso y frecuencia</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2">
              <div className="bg-[#FF6B35] h-2 rounded-full transition-all duration-500" style={{ width: `${(2 / totalSteps) * 100}%` }} />
            </div>
          </div>

          {/* Tipo de uso */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 flex flex-col gap-6">
            <div className="flex items-center gap-3 text-[#FF6B35]">
              <span className="material-symbols-outlined text-3xl">two_wheeler</span>
              <h3 className="text-2xl font-bold text-[#1E2A3A]">¿Para qué usarás tu moto?</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {USAGE_TYPES.map(({ key, icon, label, desc }) => {
                const active = answers.usageType === key
                return (
                  <button
                    key={key}
                    onClick={() => updateAnswers({ usageType: key })}
                    className={`flex flex-col items-start gap-2 p-5 rounded-xl border-2 text-left transition-all
                      ${active
                        ? 'border-[#FF6B35] bg-[#FF6B35]/5'
                        : 'border-slate-100 bg-slate-50/50 hover:border-[#FF6B35]/40'
                      }`}
                  >
                    <span className={`material-symbols-outlined text-3xl ${active ? 'text-[#FF6B35]' : 'text-slate-400'}`}>
                      {icon}
                    </span>
                    <span className={`font-bold text-sm ${active ? 'text-[#FF6B35]' : 'text-slate-700'}`}>{label}</span>
                    <span className="text-xs text-slate-500">{desc}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Frecuencia */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-2xl text-[#FF6B35]">calendar_month</span>
              <h4 className="text-lg font-bold text-[#1E2A3A]">¿Con qué frecuencia usarás la moto?</h4>
            </div>
            <div className="flex flex-col gap-3">
              {FREQUENCIES.map(({ value, label }) => {
                const active = answers.frequency === value
                return (
                  <label key={value} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="frequency"
                      value={value}
                      checked={active}
                      onChange={() => updateAnswers({ frequency: value })}
                      className="w-5 h-5 accent-[#FF6B35]"
                    />
                    <span className={`text-sm font-medium ${active ? 'text-[#FF6B35]' : 'text-slate-700'}`}>
                      {label}
                    </span>
                  </label>
                )
              })}
            </div>
          </div>

          {/* Pasajero */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-2xl text-[#FF6B35]">group</span>
              <h4 className="text-lg font-bold text-[#1E2A3A]">¿Llevarás pasajero?</h4>
            </div>
            <div className="flex gap-4">
              {[{ label: 'Sí', value: true }, { label: 'No', value: false }].map(opt => {
                const active = answers.hasPassenger === opt.value
                return (
                  <button
                    key={String(opt.value)}
                    onClick={() => updateAnswers({ hasPassenger: opt.value })}
                    className={`flex-1 py-3 rounded-xl border-2 font-semibold transition-all
                      ${active
                        ? 'border-[#FF6B35] bg-[#FF6B35]/10 text-[#FF6B35]'
                        : 'border-slate-200 text-slate-600 hover:border-[#FF6B35]/40'
                      }`}
                  >
                    {opt.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={prevStep}
              className="flex-1 py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-semibold hover:border-slate-400 transition-all"
            >
              ← Anterior
            </button>
            <button
              disabled={!canContinue}
              onClick={nextStep}
              className={`flex-1 py-3 rounded-xl font-bold text-white transition-all
                ${canContinue
                  ? 'bg-[#FF6B35] hover:bg-[#e55a25]'
                  : 'bg-slate-300 cursor-not-allowed'
                }`}
            >
              Continuar →
            </button>
          </div>

        </div>
      </main>
    </div>
  )
}
