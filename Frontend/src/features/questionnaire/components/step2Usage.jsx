import { useQuestionnaire } from '../hooks/useQuestionnaire'
import Header from '../../../shared/components/layout/header';

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

const MOTORCYCLE_SKILLS = [
  {
    value: 'automatica',
    label: 'Automática',
    desc: 'Prefieres motos fáciles de conducir y sin cambios manuales',
  },
  {
    value: 'semiautomatica',
    label: 'Semiautomática',
    desc: 'Te sientes cómodo con un control intermedio',
  },
  {
    value: 'manual',
    label: 'Manual',
    desc: 'Manejas motos con embrague y cambios convencionales',
  },
]

export default function Step2Usage() {
  const { answers, updateAnswers, nextStep, prevStep, totalSteps } = useQuestionnaire()

  const selectedUsageTypes = Array.isArray(answers.usageTypes) ? answers.usageTypes : []
  const canContinue = selectedUsageTypes.length > 0 && !!answers.motorcycleTypeExperience && Number.isInteger(Number(answers.ridingExperienceYears))

  function toggleUsageType(key) {
    const current = Array.isArray(answers.usageTypes) ? answers.usageTypes : []
    const next = current.includes(key)
      ? current.filter((item) => item !== key)
      : [...current, key]

    updateAnswers({ usageTypes: next })
  }

  function handleExperienceChange(event) {
    const years = Number.parseInt(event.target.value, 10)
    updateAnswers({ ridingExperienceYears: Number.isNaN(years) ? 0 : years })
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-[#F5F7FA] font-display text-slate-800 dark:bg-background-dark dark:text-slate-100">
      <Header sticky={false} />

      <main className="flex flex-1 justify-center py-12 px-4 md:px-0">
        <div className="flex flex-col max-w-[800px] w-full flex-1 gap-6">

          {/* Progress */}
          <div className="flex flex-col gap-3 p-6 bg-white rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:shadow-[0_20px_50px_rgba(2,6,23,0.25)]">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Paso 2 de {totalSteps}</span>
              <span className="text-sm font-semibold text-[#FF6B35]">Uso y frecuencia</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 dark:bg-slate-800">
              <div className="bg-[#FF6B35] h-2 rounded-full transition-all duration-500" style={{ width: `${(2 / totalSteps) * 100}%` }} />
            </div>
          </div>

          {/* Tipo de uso */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 flex flex-col gap-6 dark:border-slate-800 dark:bg-slate-900 dark:shadow-[0_20px_50px_rgba(2,6,23,0.25)]">
            <div className="flex items-center gap-3 text-[#FF6B35]">
              <span className="material-symbols-outlined text-3xl">two_wheeler</span>
              <h3 className="text-2xl font-bold text-[#1E2A3A] dark:text-slate-100">¿Para qué usarás tu moto?</h3>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Puedes elegir más de una opción para describir tu uso real.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {USAGE_TYPES.map(({ key, icon, label, desc }) => {
                const active = selectedUsageTypes.includes(key)
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleUsageType(key)}
                    className={`flex flex-col items-start gap-2 p-5 rounded-xl border-2 text-left transition-all
                      ${active
                        ? 'border-[#FF6B35] bg-[#FF6B35]/5'
                        : 'border-slate-100 bg-slate-50/50 hover:border-[#FF6B35]/40 dark:border-slate-700 dark:bg-slate-950/40 dark:hover:border-[#FF6B35]/60'
                      }`}
                  >
                    <span className={`material-symbols-outlined text-3xl ${active ? 'text-[#FF6B35]' : 'text-slate-400 dark:text-slate-500'}`}>
                      {icon}
                    </span>
                    <span className={`font-bold text-sm ${active ? 'text-[#FF6B35]' : 'text-slate-700 dark:text-slate-200'}`}>{label}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{desc}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Tipo de moto que sabe manejar */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 flex flex-col gap-4 dark:border-slate-800 dark:bg-slate-900 dark:shadow-[0_20px_50px_rgba(2,6,23,0.25)]">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-2xl text-[#FF6B35]">settings</span>
              <h4 className="text-lg font-bold text-[#1E2A3A] dark:text-slate-100">¿Qué tipo de moto sabes manejar?</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {MOTORCYCLE_SKILLS.map(({ value, label, desc }) => {
                const active = answers.motorcycleTypeExperience === value
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => updateAnswers({ motorcycleTypeExperience: value })}
                    className={`flex flex-col items-start gap-2 rounded-xl border-2 p-5 text-left transition-all
                      ${active
                        ? 'border-[#FF6B35] bg-[#FF6B35]/5'
                        : 'border-slate-100 bg-slate-50/50 hover:border-[#FF6B35]/40 dark:border-slate-700 dark:bg-slate-950/40 dark:hover:border-[#FF6B35]/60'
                      }`}
                  >
                    <span className={`text-sm font-black uppercase tracking-widest ${active ? 'text-[#FF6B35]' : 'text-slate-500 dark:text-slate-400'}`}>
                      {label}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{desc}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Experiencia */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 flex flex-col gap-4 dark:border-slate-800 dark:bg-slate-900 dark:shadow-[0_20px_50px_rgba(2,6,23,0.25)]">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-2xl text-[#FF6B35]">military_tech</span>
              <h4 className="text-lg font-bold text-[#1E2A3A] dark:text-slate-100">¿Cuántos años llevas manejando moto?</h4>
            </div>
            <div className="flex flex-col items-center gap-4">
              <div className="text-center">
                <span className="text-6xl font-black text-[#FF6B35]">{answers.ridingExperienceYears}</span>
                <span className="text-sm font-semibold text-slate-400 block mt-1 dark:text-slate-500">AÑOS</span>
              </div>
              <div className="w-full flex items-center gap-3">
                <span className="text-xs text-slate-400 whitespace-nowrap dark:text-slate-500">0</span>
                <input
                  type="range"
                  min={0}
                  max={30}
                  value={answers.ridingExperienceYears}
                  onChange={handleExperienceChange}
                  className="w-full h-2 rounded-full accent-[#FF6B35] cursor-pointer"
                />
                <span className="text-xs text-slate-400 whitespace-nowrap dark:text-slate-500">30+</span>
              </div>
            </div>
          </div>

          {/* Frecuencia */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 flex flex-col gap-4 dark:border-slate-800 dark:bg-slate-900 dark:shadow-[0_20px_50px_rgba(2,6,23,0.25)]">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-2xl text-[#FF6B35]">calendar_month</span>
              <h4 className="text-lg font-bold text-[#1E2A3A] dark:text-slate-100">¿Con qué frecuencia usarás la moto?</h4>
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
                    <span className={`text-sm font-medium ${active ? 'text-[#FF6B35]' : 'text-slate-700 dark:text-slate-200'}`}>
                      {label}
                    </span>
                  </label>
                )
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={prevStep}
              className="flex-1 py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-semibold hover:border-slate-400 transition-all dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-500"
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
