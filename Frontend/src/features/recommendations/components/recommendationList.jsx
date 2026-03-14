import { useNavigate } from 'react-router-dom'
import { useRecommendations } from '../hooks/useRecommendations'

const USAGE_LABELS = {
  ciudad:    'ciudad',
  carretera: 'carretera',
  trabajo:   'trabajo',
  offroad:   'off-road',
  deporte:   'deporte',
  mixto:     'uso mixto',
}

function formatCOP(value) {
  if (!value) return 'Consultar'
  return new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', maximumFractionDigits: 0,
  }).format(value)
}

// Badge: smaller size, colors matching the reference design
function MatchBadge({ score, large = false }) {
  const bg =
    score >= 85 ? '#28A745' :
    score >= 65 ? '#FF6B35' :
                  '#64748B'
  return (
    <div
      className={`rounded-lg text-white font-black shadow-md flex items-center gap-1 ${
        large ? 'px-4 py-2 text-lg' : 'px-3 py-1.5 text-sm'
      }`}
      style={{ backgroundColor: bg }}
    >
      {score}% Match
    </div>
  )
}

function ReasonsList({ reasons = [], warnings = [] }) {
  return (
    <div className="space-y-2.5">
      {reasons.slice(0, 2).map((r, i) => (
        <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-[#F5F7FA] border border-[#0A2463]/5">
          <span className="material-symbols-outlined text-[#0A2463] text-base mt-0.5">check_circle</span>
          <p className="text-[#1A202C] text-sm leading-relaxed">{r}</p>
        </div>
      ))}
      {warnings.slice(0, 1).map((w, i) => (
        <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-amber-50 border border-amber-100">
          <span className="material-symbols-outlined text-amber-500 text-base mt-0.5">warning</span>
          <p className="text-amber-800 text-sm leading-relaxed">{w}</p>
        </div>
      ))}
    </div>
  )
}

function TopCard({ rec, navigate }) {
  const moto = rec.motorcycle
  return (
    <div className="group relative flex flex-col lg:flex-row items-stretch rounded-2xl overflow-hidden bg-white border border-[#E2E8F0] shadow-xl transition-all hover:shadow-2xl">
      <div className="w-full lg:w-3/5 relative overflow-hidden h-[300px] lg:h-auto bg-slate-100">
        {moto.imageUrl ? (
          <img
            src={moto.imageUrl}
            alt={`${moto.brand} ${moto.model}`}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="material-symbols-outlined text-8xl text-slate-300">two_wheeler</span>
          </div>
        )}
        <div className="absolute top-5 left-5">
          <MatchBadge score={rec.compatibilityScore} large />
        </div>
      </div>
      <div className="flex flex-col flex-1 p-8 lg:p-10 justify-center border-l border-[#E2E8F0]">
        <p className="text-[#FF6B35] text-xs font-black tracking-[0.2em] mb-2 uppercase">Recomendación Destacada</p>
        <h3 className="text-[#0A2463] text-3xl font-black mb-5">{moto.brand} {moto.model}</h3>
        <div className="mb-6">
          <ReasonsList reasons={rec.reasons} warnings={rec.warnings} />
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm text-[#64748B] mb-6">
          {moto.engineCc && <span className="bg-[#F5F7FA] px-3 py-1 rounded-full border border-[#E2E8F0] font-medium">{moto.engineCc}cc</span>}
          {moto.seatHeightCm && <span className="bg-[#F5F7FA] px-3 py-1 rounded-full border border-[#E2E8F0] font-medium">Asiento {moto.seatHeightCm}cm</span>}
          {moto.weightKg && <span className="bg-[#F5F7FA] px-3 py-1 rounded-full border border-[#E2E8F0] font-medium">{moto.weightKg}kg</span>}
        </div>
        <div className="flex flex-wrap items-center gap-3 mt-auto">
          <span className="text-[#0A2463] font-black text-2xl">{formatCOP(moto.price)}</span>
          <button
            onClick={() => navigate(`/motorcycles/${moto.id}`)}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#FF6B35] text-white font-bold hover:bg-[#e55a25] transition-all shadow-md"
          >
            Ver detalles
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  )
}

function AlternativeCard({ rec, navigate }) {
  const moto = rec.motorcycle
  return (
    <div className="flex flex-col bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden hover:shadow-xl transition-all group">
      <div className="relative h-48 overflow-hidden bg-slate-100">
        {moto.imageUrl ? (
          <img
            src={moto.imageUrl}
            alt={`${moto.brand} ${moto.model}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="material-symbols-outlined text-6xl text-slate-300">two_wheeler</span>
          </div>
        )}
        <div className="absolute top-3 right-3">
          <MatchBadge score={rec.compatibilityScore} />
        </div>
      </div>
      <div className="p-5 flex flex-col flex-1">
        <h4 className="text-[#0A2463] text-lg font-bold mb-1">{moto.brand} {moto.model}</h4>
        {moto.engineCc && <p className="text-[#64748B] text-sm mb-3">{moto.engineCc}cc · {moto.year || ''}</p>}
        {rec.reasons[0] && (
          <p className="text-[#64748B] text-xs mb-4 line-clamp-2">{rec.reasons[0]}</p>
        )}
        <div className="mt-auto pt-4 flex items-center justify-between border-t border-[#E2E8F0]">
          <span className="text-[#0A2463] font-black">{formatCOP(moto.price)}</span>
          <button
            onClick={() => navigate(`/motorcycles/${moto.id}`)}
            className="text-[#FF6B35] text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all"
          >
            Saber más
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default function RecommendationList() {
  const navigate = useNavigate()
  const { recommendations, questionnaire, loading, error } = useRecommendations()
  const user = JSON.parse(sessionStorage.getItem('mm_user') || 'null')

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F7FA]">
        <div className="flex flex-col items-center gap-4">
          <svg className="animate-spin w-12 h-12 text-[#FF6B35]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
          <p className="text-[#64748B] font-medium">Cargando tus recomendaciones...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F7FA] px-4">
        <div className="flex flex-col items-center gap-5 text-center max-w-md">
          <span className="material-symbols-outlined text-6xl text-red-400">error</span>
          <h2 className="text-xl font-bold text-[#1A202C]">{error}</h2>
          <button onClick={() => navigate('/')} className="px-8 py-3 rounded-xl bg-[#FF6B35] text-white font-bold hover:bg-[#e55a25] transition-all">
            Volver al inicio
          </button>
        </div>
      </div>
    )
  }

  if (recommendations.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F7FA] px-4">
        <div className="flex flex-col items-center gap-5 text-center max-w-md">
          <span className="material-symbols-outlined text-6xl text-[#FF6B35]">two_wheeler</span>
          <h2 className="text-2xl font-black text-[#1A202C]">Sin recomendaciones aún</h2>
          <p className="text-[#64748B]">Completa el cuestionario para que podamos encontrar las motos ideales para ti.</p>
          <button onClick={() => navigate('/questionnaire')} className="px-8 py-3 rounded-xl bg-[#FF6B35] text-white font-bold hover:bg-[#e55a25] transition-all">
            Ir al cuestionario
          </button>
        </div>
      </div>
    )
  }

  const [top, ...rest] = recommendations
  // Show only the next 3 alternatives
  const alternatives = rest.slice(0, 3)

  // Build personalised subtitle from questionnaire data
  const userName = user?.name?.split(' ')[0] || 'usuario'
  const budget   = questionnaire?.budget   ? formatCOP(questionnaire.budget)   : null
  const usage    = questionnaire?.usageType ? USAGE_LABELS[questionnaire.usageType] || questionnaire.usageType : null
  const height   = questionnaire?.heightCm  ? `${questionnaire.heightCm}cm`    : null

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-[#F5F7FA] font-sans text-[#1A202C]">

      {/* Header */}
      <header className="flex items-center justify-between border-b border-[#E2E8F0] px-6 md:px-20 py-4 bg-white shadow-sm sticky top-0 z-30">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <div className="text-primary dark:text-accent">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 48 48">
              <path d="M36.7273 44C33.9891 44 31.6043 39.8386 30.3636 33.69C29.123 39.8386 26.7382 44 24 44C21.2618 44 18.877 39.8386 17.6364 33.69C16.3957 39.8386 14.0109 44 11.2727 44C7.25611 44 4 35.0457 4 24C4 12.9543 7.25611 4 11.2727 4C14.0109 4 16.3957 8.16144 17.6364 14.31C18.877 8.16144 21.2618 4 24 4C26.7382 4 29.123 8.16144 30.3636 14.31C31.6043 8.16144 33.9891 4 36.7273 4C40.7439 4 44 12.9543 44 24C44 35.0457 40.7439 44 36.7273 44Z"/>
            </svg>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-primary dark:text-slate-100">MotorMatch</h1>
        </div>
        <div className="flex items-center gap-3">
          {user && (
            <span className="hidden md:block text-sm text-[#64748B]">
              Hola, <span className="font-semibold text-[#0A2463]">{user.name}</span>
            </span>
          )}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0A2463] text-white text-sm font-bold hover:bg-[#0A2463]/90 transition-all"
          >
            <span className="material-symbols-outlined text-base">home</span>
            <span className="hidden sm:inline">Inicio</span>
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-10">

        {/* Page title — personalised */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
          <div className="flex flex-col gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#28A745]/10 text-[#28A745] text-xs font-bold tracking-wider uppercase w-fit">
              <span className="material-symbols-outlined text-sm">check_circle</span>
              Análisis Completado
            </div>
            <h1 className="text-[#0A2463] text-3xl md:text-4xl font-black leading-tight tracking-tight">
              ¡Listo, {userName}! Aquí tienes tus matches ideales
            </h1>
            {(budget || usage || height) && (
              <p className="text-[#64748B] text-sm leading-relaxed max-w-lg">
                Basado en{budget && <> tu presupuesto de <span className="font-semibold text-[#0A2463]">{budget}</span></>}
                {usage  && <>{budget ? ',' : ''} uso en <span className="font-semibold text-[#0A2463]">{usage}</span></>}
                {height && <>{(budget || usage) ? ' y' : ''} estatura de <span className="font-semibold text-[#0A2463]">{height}</span></>}.
              </p>
            )}
          </div>
          <button
            onClick={() => { sessionStorage.removeItem('mm_recommendations'); navigate('/questionnaire') }}
            className="flex items-center gap-2 px-5 py-3 rounded-lg bg-white border border-[#E2E8F0] text-[#1A202C] hover:bg-slate-50 transition-colors text-sm font-bold uppercase tracking-wide shadow-sm whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-lg">restart_alt</span>
            REINICIAR CUESTIONARIO
          </button>
        </div>

        {/* Best match */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-5">
            <span className="material-symbols-outlined text-[#FF6B35]">stars</span>
            <h2 className="text-[#0A2463] text-2xl font-extrabold tracking-tight">MEJOR OPCIÓN</h2>
          </div>
          <TopCard rec={top} navigate={navigate} />
        </section>

        {/* Next 3 alternatives */}
        {alternatives.length > 0 && (
          <section>
            <h3 className="text-[#0A2463] text-2xl font-extrabold tracking-tight mb-6">
              Otras alternativas sugeridas
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {alternatives.map(rec => (
                <AlternativeCard key={rec.id} rec={rec} navigate={navigate} />
              ))}
            </div>
          </section>
        )}

      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-background-dark border-t border-primary/10 py-12 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="flex items-center gap-2 text-primary dark:text-accent opacity-80">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 48 48">
                <path d="M36.7273 44C33.9891 44 31.6043 39.8386 30.3636 33.69C29.123 39.8386 26.7382 44 24 44C21.2618 44 18.877 39.8386 17.6364 33.69C16.3957 39.8386 14.0109 44 11.2727 44C7.25611 44 4 35.0457 4 24C4 12.9543 7.25611 4 11.2727 4C14.0109 4 16.3957 8.16144 17.6364 14.31C18.877 8.16144 21.2618 4 24 4C26.7382 4 29.123 8.16144 30.3636 14.31C31.6043 8.16144 33.9891 4 36.7273 4C40.7439 4 44 12.9543 44 24C44 35.0457 40.7439 44 36.7273 44Z"/>
              </svg>
              <span className="font-bold">MotorMatch © 2026</span>
            </div>
            <p className="text-sm text-slate-500">Conectando pasiones, kilómetro a kilómetro.</p>
          </div>
          <nav className="flex flex-wrap justify-center gap-8">
            <a className="text-neutral-dark dark:text-slate-300 hover:text-accent font-medium transition-colors" href="#">Aviso Legal</a>
            <a className="text-neutral-dark dark:text-slate-300 hover:text-accent font-medium transition-colors" href="#">Privacidad</a>
            <a className="text-neutral-dark dark:text-slate-300 hover:text-accent font-medium transition-colors" href="#">Soporte</a>
            <a className="text-neutral-dark dark:text-slate-300 hover:text-accent font-medium transition-colors" href="#">Contacto</a>
          </nav>
        </div>
      </footer>
    </div>
  )
}
