import { useNavigate } from 'react-router-dom'
import Header from '../shared/components/layout/header'
import useAuthAction from '../features/auth/hooks/useAuthAction'

const WHAT_IS_CARDS = [
  {
    icon: 'psychology',
    title: 'Recomendación inteligente',
    text: 'MotorMatch conecta datos técnicos, presupuesto y estilo de uso para acercarte a una moto que realmente encaje contigo.',
  },
  {
    icon: 'compare_arrows',
    title: 'Comparación clara',
    text: 'Te ayuda a comparar modelos sin perderte entre fichas técnicas extensas, especificaciones dispersas o decisiones poco informadas.',
  },
  {
    icon: 'tune',
    title: 'Personalización útil',
    text: 'No se trata solo de listar motos: la plataforma prioriza opciones según perfil, ergonomía, necesidades y contexto real de compra en Colombia.',
  },
]

const HOW_IT_WORKS = [
  {
    step: '01',
    icon: 'storefront',
    title: 'Explora el catálogo',
    text: 'Empieza desde la página principal viendo motos, marcas, filtros, tendencias y fichas técnicas sin iniciar sesión.',
  },
  {
    step: '02',
    icon: 'assignment',
    title: 'Completa tu perfil',
    text: 'Cuando quieras personalizar la experiencia, respondes un cuestionario breve con presupuesto, uso y preferencias.',
  },
  {
    step: '03',
    icon: 'compare_arrows',
    title: 'Compara con contexto',
    text: 'Cruza modelos, revisa atributos clave y entiende mejor diferencias reales antes de tomar una decisión.',
  },
  {
    step: '04',
    icon: 'auto_awesome',
    title: 'Recibe recomendaciones',
    text: 'MotorMatch ordena opciones compatibles y reduce la fricción al momento de decidir qué moto vale la pena para ti.',
  },
]

const PROBLEM_POINTS = [
  'Elegir moto suele implicar demasiada información dispersa y difícil de interpretar.',
  'Muchos compradores no tienen asesoría personalizada según su contexto real.',
  'Comparar modelos de varias marcas puede tomar más tiempo del necesario.',
  'No siempre es fácil saber si una moto sí se ajusta a presupuesto, ergonomía y uso diario.',
]

const OBJECTIVE_FEATURES = [
  {
    icon: 'hub',
    title: 'Algoritmos de afinidad',
    text: 'Optimizar la búsqueda personalizada mediante algoritmos que comprendan el perfil único de cada conductor.',
  },
  {
    icon: 'database',
    title: 'Centralización técnica',
    text: 'Unificar información técnica y comercial de las principales marcas en una sola experiencia de consulta.',
  },
  {
    icon: 'health_and_safety',
    title: 'Compra más segura',
    text: 'Fomentar mejores decisiones recomendando motos adecuadas a ergonomía, experiencia y contexto de uso.',
  },
  {
    icon: 'insights',
    title: 'Datos útiles para decidir',
    text: 'Facilitar comparativas claras y contexto del mercado colombiano para reducir incertidumbre en la compra.',
  },
]

const OBJECTIVE_PILLARS = [
  {
    icon: 'rocket_launch',
    title: 'Objetivo general',
    text: 'Transformar la experiencia de adquisición de motocicletas en Colombia mediante tecnología inteligente.',
  },
  {
    icon: 'devices',
    title: 'Experiencia de usuario',
    text: 'Construir una interfaz simple, escaneable, moderna y de baja carga cognitiva para usuarios nuevos y frecuentes.',
  },
  {
    icon: 'accessibility_new',
    title: 'Accesibilidad y claridad',
    text: 'Presentar información relevante con jerarquía visual clara para que el proceso de decisión sea más comprensible.',
  },
]

const PROGRESS_ITEMS = [
  {
    status: 'Implementado',
    tone: 'emerald',
    progress: '100%',
    title: 'Catálogo público y exploración',
    text: 'Navegación abierta para explorar motos, marcas, filtros, búsqueda y fichas técnicas.',
  },
  {
    status: 'Implementado',
    tone: 'emerald',
    progress: '100%',
    title: 'Autenticación y cuenta',
    text: 'Login, registro y protección de funciones privadas como favoritos, historiales y simulaciones.',
  },
  {
    status: 'Activo',
    tone: 'amber',
    progress: '75%',
    title: 'Comparador y flujo guiado',
    text: 'Comparación visual de modelos y reorganización de la experiencia para mantener continuidad antes y después del login.',
  },
  {
    status: 'Activo',
    tone: 'amber',
    progress: '70%',
    title: 'Recomendaciones personalizadas',
    text: 'Motor de match basado en cuestionario, perfil del usuario y criterios de afinidad.',
  },
  {
    status: 'Activo',
    tone: 'blue',
    progress: '65%',
    title: 'Tendencias y análisis',
    text: 'Visualización de señales del mercado y herramientas para ampliar la toma de decisiones.',
  },
  {
    status: 'Próximo',
    tone: 'slate',
    progress: 'Próximo',
    title: 'Mejoras futuras',
    text: 'Más automatización, mayor profundidad analítica y refinamiento continuo de la experiencia integral.',
  },
]

const COMMUNITY_VALUES = [
  'Ayudar a motociclistas a decidir mejor, no solo a mirar fichas técnicas.',
  'Centralizar información del mercado en una experiencia más intuitiva.',
  'Reducir fricción, dudas y ruido antes de la compra.',
  'Convertir la tecnología en una asesoría práctica para usuarios reales.',
]

function toneClasses(tone) {
  switch (tone) {
    case 'emerald':
      return {
        badge: 'bg-emerald-100 text-emerald-700',
        bar: 'bg-emerald-500',
      }
    case 'amber':
      return {
        badge: 'bg-amber-100 text-amber-700',
        bar: 'bg-amber-500',
      }
    case 'blue':
      return {
        badge: 'bg-blue-100 text-blue-700',
        bar: 'bg-[#0A2463]',
      }
    default:
      return {
        badge: 'bg-slate-100 text-slate-600',
        bar: 'bg-slate-400',
      }
  }
}

export default function AboutPage() {
  const navigate = useNavigate()
  const { requireAuth, authModal } = useAuthAction()

  return (
    <div className="min-h-screen overflow-x-hidden bg-[linear-gradient(180deg,#F5F7FA_0%,#EEF3FB_45%,#F7F9FC_100%)] text-slate-900">
      <Header sticky={false} />
      {authModal}

      <main className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-10">
        <section className="relative overflow-hidden rounded-[2rem] bg-[#0A2463] px-6 py-10 text-white shadow-[0_30px_100px_rgba(10,36,99,0.28)] md:px-10 md:py-14">
          <div className="absolute inset-0">
            <div className="absolute -right-20 top-0 h-72 w-72 rounded-full bg-[#FF6B35]/15 blur-3xl" />
            <div className="absolute left-0 top-1/2 h-80 w-80 -translate-x-1/3 -translate-y-1/2 rounded-full bg-white/10 blur-3xl" />
          </div>

          <div className="relative z-10 grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.34em] text-white/65">Página institucional</p>
              <h1 className="mt-4 max-w-3xl text-4xl font-black leading-tight tracking-tight md:text-6xl">
                Tecnología y motociclismo para decidir mejor.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-white/80 md:text-lg">
                MotorMatch es una plataforma pensada para comparar, entender y descubrir motocicletas en Colombia con una experiencia moderna, clara y asistida por lógica inteligente.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => navigate('/catalogo')}
                  className="rounded-2xl bg-[#FF6B35] px-6 py-3 text-sm font-black uppercase tracking-[0.18em] text-white transition hover:brightness-110"
                >
                  Explorar catálogo
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!requireAuth({
                      action: { type: 'navigate', to: '/comparar' },
                      title: 'Debes iniciar sesión o registrarte para comenzar una comparación guiada.',
                      description: 'Así podrás mantener continuidad en tu proceso y guardar tu progreso cuando lo necesites.',
                    })) return

                    navigate('/comparar')
                  }}
                  className="rounded-2xl border border-white/20 bg-white/10 px-6 py-3 text-sm font-black uppercase tracking-[0.18em] text-white transition hover:bg-white/15"
                >
                  Comenzar comparación
                </button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <article className="rounded-[1.75rem] border border-white/10 bg-white/10 p-5 backdrop-blur">
                <span className="material-symbols-outlined text-3xl text-[#FF6B35]">two_wheeler</span>
                <h2 className="mt-4 text-xl font-black">Qué es MotorMatch</h2>
                <p className="mt-2 text-sm leading-6 text-white/78">
                  Una plataforma para comparar motos, filtrar opciones y recibir orientación más útil antes de comprar.
                </p>
              </article>
              <article className="rounded-[1.75rem] border border-white/10 bg-white/10 p-5 backdrop-blur">
                <span className="material-symbols-outlined text-3xl text-[#FF6B35]">memory</span>
                <h2 className="mt-4 text-xl font-black">Por qué existe</h2>
                <p className="mt-2 text-sm leading-6 text-white/78">
                  Para reducir ruido, centralizar información del mercado y apoyar decisiones con más criterio y menos fricción.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section className="mt-10 grid gap-6 md:grid-cols-3">
          {WHAT_IS_CARDS.map((item) => (
            <article key={item.title} className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0A2463]/5 text-[#0A2463]">
                <span className="material-symbols-outlined text-3xl">{item.icon}</span>
              </div>
              <h2 className="mt-5 text-2xl font-black text-[#0A2463]">{item.title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">{item.text}</p>
            </article>
          ))}
        </section>

        <section className="mt-12 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.32em] text-[#FF6B35]">Cómo funciona</p>
              <h2 className="mt-2 text-3xl font-black text-[#0A2463]">Un flujo simple para una decisión compleja</h2>
            </div>
            <p className="max-w-2xl text-sm leading-6 text-slate-500">
              La idea no es abrumarte con pasos, sino darte una ruta clara desde la exploración hasta la recomendación.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {HOW_IT_WORKS.map((item) => (
              <article key={item.step} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#FF6B35] shadow-sm">
                    <span className="material-symbols-outlined">{item.icon}</span>
                  </span>
                  <span className="rounded-full bg-[#0A2463]/10 px-3 py-1 text-xs font-black text-[#0A2463]">{item.step}</span>
                </div>
                <h3 className="mt-5 text-xl font-black text-[#0A2463]">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-12 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <article className="rounded-[2rem] bg-[#0A2463] p-8 text-white shadow-[0_24px_80px_rgba(10,36,99,0.22)]">
            <p className="text-[11px] font-black uppercase tracking-[0.32em] text-white/60">Problema que resolvemos</p>
            <h2 className="mt-3 text-3xl font-black">Elegir moto no debería sentirse como navegar a ciegas.</h2>
            <p className="mt-4 text-sm leading-7 text-white/78">
              Comprar una motocicleta implica presupuesto, seguridad, ergonomía, uso diario y demasiada información técnica. MotorMatch existe para bajar esa carga mental.
            </p>
          </article>

          <div className="grid gap-4 sm:grid-cols-2">
            {PROBLEM_POINTS.map((point, index) => (
              <article key={point} className="rounded-[1.6rem] border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FF6B35]/10 text-[#FF6B35]">
                    <span className="material-symbols-outlined">report_problem</span>
                  </span>
                  <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Punto {index + 1}</span>
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-600">{point}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-12 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.32em] text-[#FF6B35]">Objetivos del proyecto</p>
              <h2 className="mt-2 text-3xl font-black text-[#0A2463]">Objetivos integrados a una sola experiencia</h2>
            </div>
            <p className="max-w-2xl text-sm leading-6 text-slate-500">
              En lugar de separar esta información en otra página importante, aquí se muestra el propósito del sistema de forma más útil y escaneable.
            </p>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
            <div className="grid gap-4">
              {OBJECTIVE_PILLARS.map((item) => (
                <article key={item.title} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#0A2463] shadow-sm">
                      <span className="material-symbols-outlined">{item.icon}</span>
                    </span>
                    <h3 className="text-lg font-black text-[#0A2463]">{item.title}</h3>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-slate-600">{item.text}</p>
                </article>
              ))}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {OBJECTIVE_FEATURES.map((item) => (
                <article key={item.title} className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm transition hover:border-[#FF6B35]/30 hover:shadow-md">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FF6B35]/10 text-[#FF6B35]">
                    <span className="material-symbols-outlined">{item.icon}</span>
                  </div>
                  <h3 className="mt-4 text-lg font-black text-[#0A2463]">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-12 rounded-[2rem] bg-[#0A2463] p-6 text-white shadow-[0_30px_100px_rgba(10,36,99,0.24)] md:p-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.32em] text-white/60">Avances del proyecto</p>
              <h2 className="mt-2 text-3xl font-black">Progreso visible, no solo intención</h2>
            </div>
            <p className="max-w-2xl text-sm leading-6 text-white/75">
              Aquí se integran los avances que antes vivían en una pantalla aparte, con foco en hitos funcionales y próximos pasos reales.
            </p>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {PROGRESS_ITEMS.map((item) => {
              const tones = toneClasses(item.tone)

              return (
                <article key={item.title} className="rounded-[1.6rem] border border-white/10 bg-white/8 p-5 backdrop-blur">
                  <div className="flex items-center justify-between gap-3">
                    <span className={`rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] ${tones.badge}`}>
                      {item.status}
                    </span>
                    <span className="text-xs font-bold text-white/60">{item.progress}</span>
                  </div>
                  <h3 className="mt-4 text-xl font-black">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-white/76">{item.text}</p>
                  <div className="mt-5 h-2 rounded-full bg-white/10">
                    <div
                      className={`h-full rounded-full ${tones.bar}`}
                      style={{ width: item.progress.includes('%') ? item.progress : '28%' }}
                    />
                  </div>
                </article>
              )
            })}
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <article className="rounded-[1.6rem] border border-white/10 bg-white/8 p-6 backdrop-blur">
              <span className="inline-flex items-center gap-2 rounded-full bg-[#FF6B35]/15 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-[#FF6B35]">
                <span className="material-symbols-outlined text-sm">memory</span>
                Hito destacado
              </span>
              <h3 className="mt-4 text-2xl font-black">Motor de recomendación y comparación con más contexto</h3>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/76">
                El foco actual de MotorMatch está en unir catálogo público, autenticación contextual y recomendaciones inteligentes para que el usuario no sienta cortes bruscos en su recorrido.
              </p>
            </article>

            <article className="rounded-[1.6rem] border border-white/10 bg-white/8 p-6 backdrop-blur">
              <h3 className="text-xl font-black">Roadmap inmediato</h3>
              <ul className="mt-4 space-y-3">
                <li className="flex items-start gap-3 text-sm text-white/78">
                  <span className="material-symbols-outlined mt-0.5 text-[#FF6B35]">check_circle</span>
                  Mejorar continuidad entre exploración pública y funciones personalizadas.
                </li>
                <li className="flex items-start gap-3 text-sm text-white/78">
                  <span className="material-symbols-outlined mt-0.5 text-[#FF6B35]">check_circle</span>
                  Afinar comparativas, historial y guardado inteligente de acciones.
                </li>
                <li className="flex items-start gap-3 text-sm text-white/78">
                  <span className="material-symbols-outlined mt-0.5 text-white/40">radio_button_unchecked</span>
                  Profundizar el análisis de mercado y las recomendaciones futuras.
                </li>
              </ul>
            </article>
          </div>
        </section>

        <section className="mt-12 grid gap-6 lg:grid-cols-[1fr_0.95fr]">
          <article className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-[11px] font-black uppercase tracking-[0.32em] text-[#FF6B35]">Comunidad y visión</p>
            <h2 className="mt-3 text-3xl font-black text-[#0A2463]">MotorMatch quiere ser más que un buscador.</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              La visión es crear una experiencia intuitiva que ayude a motociclistas a entender mejor el mercado, comparar con sentido y tomar decisiones con más confianza.
            </p>

            <div className="mt-6 grid gap-3">
              {COMMUNITY_VALUES.map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-2xl bg-slate-50 px-4 py-4">
                  <span className="material-symbols-outlined mt-0.5 text-[#FF6B35]">done</span>
                  <p className="text-sm leading-6 text-slate-600">{item}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="overflow-hidden rounded-[2rem] bg-[#0A2463] p-8 text-white shadow-[0_24px_80px_rgba(10,36,99,0.22)]">
            <p className="text-[11px] font-black uppercase tracking-[0.32em] text-white/60">Cierre</p>
            <h2 className="mt-3 text-3xl font-black">Una plataforma pensada para decisiones reales.</h2>
            <p className="mt-4 text-sm leading-7 text-white/78">
              MotorMatch busca unir tecnología, datos y experiencia de usuario para que encontrar una moto no dependa del azar ni del exceso de información dispersa.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => navigate('/catalogo')}
                className="rounded-2xl bg-[#FF6B35] px-5 py-3 text-sm font-black uppercase tracking-[0.18em] text-white transition hover:brightness-110"
              >
                Ir al catálogo
              </button>
              <button
                type="button"
                onClick={() => navigate('/contacto')}
                className="rounded-2xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-black uppercase tracking-[0.18em] text-white transition hover:bg-white/15"
              >
                Contacto
              </button>
            </div>
          </article>
        </section>
      </main>

      <footer className="mt-8 border-t border-white/40 bg-[#0A2463]">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 md:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="text-2xl font-black text-white">MotorMatch</div>
            <p className="mt-1 text-xs uppercase tracking-[0.22em] text-slate-400">Acelerando tu decisión</p>
          </div>

          <div className="flex flex-wrap gap-6 text-sm font-semibold text-slate-300">
            <button type="button" onClick={() => navigate('/catalogo')} className="transition hover:text-white">Catálogo</button>
            <button type="button" onClick={() => navigate('/nosotros')} className="transition hover:text-white">Nosotros</button>
            <button type="button" onClick={() => navigate('/contacto')} className="transition hover:text-white">Contacto</button>
            <button type="button" onClick={() => navigate('/ayuda')} className="transition hover:text-white">Soporte</button>
            <button type="button" className="transition hover:text-white">Términos</button>
            <button type="button" className="transition hover:text-white">Privacidad</button>
          </div>

          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
            © 2026 MotorMatch. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}
