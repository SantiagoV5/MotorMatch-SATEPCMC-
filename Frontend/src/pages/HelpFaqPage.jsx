import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SUPPORT_EMAIL, SUPPORT_MAILTO } from '../shared/constants/support'

const faqCategories = [
  {
    id: 'sobre-motormatch',
    icon: 'dashboard',
    title: 'Sobre MotorMatch',
    description: 'Qué hace la plataforma y cómo te ayuda a tomar una mejor decisión.',
    questions: [
      {
        question: '¿Cómo funciona MotorMatch?',
        answer: [
          'Primero creas tu cuenta y completas el cuestionario con tu presupuesto, estatura, uso y preferencias. Después, la plataforma cruza esos datos con el catálogo de motos disponibles y ordena las opciones por compatibilidad.',
          'Desde allí puedes comparar motos, guardar favoritas y revisar el simulador de costos antes de decidir.',
        ],
      },
      {
        question: '¿Es gratis?',
        answer: [
          'Sí. Las funciones principales de MotorMatch están pensadas para uso gratuito: cuestionario, recomendaciones, favoritos, comparaciones, análisis de mercado y simulación de costos.',
          'Si en el futuro aparece alguna funcionalidad adicional con condiciones distintas, te lo mostraremos antes de usarla.',
        ],
      },
    ],
  },
  {
    id: 'sobre-el-cuestionario',
    icon: 'fact_check',
    title: 'Sobre el cuestionario',
    description: 'Cómo se usa tu perfil para afinar las recomendaciones.',
    questions: [
      {
        question: '¿Para qué sirve el cuestionario?',
        answer: [
          'El cuestionario le da contexto a MotorMatch: presupuesto, estatura, peso, tipo de uso y preferencias de marca. Con eso el sistema puede filtrar motos que realmente te convengan.',
          'Mientras más completo sea tu perfil, más útiles serán las recomendaciones y las advertencias.',
        ],
      },
      {
        question: '¿Puedo cambiarlo?',
        answer: [
          'Sí. Puedes volver a completarlo cuando cambien tus necesidades, tu presupuesto o tu forma de usar la moto.',
          'Al actualizarlo, el sistema recalcula tus recomendaciones para reflejar el nuevo perfil.',
        ],
      },
    ],
  },
  {
    id: 'sobre-las-recomendaciones',
    icon: 'recommend',
    title: 'Sobre las recomendaciones',
    description: 'Qué evalúa el sistema cuando calcula compatibilidad.',
    questions: [
      {
        question: '¿Cómo se calculan?',
        answer: [
          'MotorMatch asigna un puntaje de compatibilidad a cada moto considerando presupuesto, altura del asiento, peso, tipo de uso y marcas preferidas. Además, muestra razones y advertencias para que veas por qué una moto sube o baja en el ranking.',
          'El objetivo no es solo ordenar motos, sino explicarte de forma clara por qué una opción encaja contigo.',
        ],
      },
      {
        question: '¿Son precisas?',
        answer: [
          'Son una guía muy útil, pero no una garantía absoluta. La precisión depende de la calidad de los datos de la moto y de qué tan bien describas tu situación real en el cuestionario.',
          'Te recomendamos usar las recomendaciones como punto de partida y validarlas con una prueba de manejo, la ficha técnica y el precio final del concesionario.',
        ],
      },
    ],
  },
  {
    id: 'sobre-la-compra',
    icon: 'storefront',
    title: 'Sobre la compra',
    description: 'Consejos para comparar precios y elegir dónde comprar.',
    questions: [
      {
        question: '¿Dónde comprar?',
        answer: [
          'MotorMatch no vende motos directamente. Te ayuda a comparar opciones para que luego revises concesionarios autorizados, vitrinas multimarca y portales confiables de segunda mano.',
          'Antes de cerrar una compra, revisa garantía, historial, documentos y costos extra como matrícula, seguro y mantenimiento.',
        ],
      },
      {
        question: '¿Los precios son reales?',
        answer: [
          'Los precios que ves son referenciales y sirven para comparar el mercado. Pueden variar por ciudad, disponibilidad, promociones, año del modelo y condiciones del vendedor.',
          'Antes de tomar la decisión final, valida el valor actualizado directamente con el concesionario o vendedor.',
        ],
      },
    ],
  },
  {
    id: 'sobre-mi-cuenta',
    icon: 'manage_accounts',
    title: 'Sobre mi cuenta',
    description: 'Recuperación de acceso y gestión de tu perfil.',
    questions: [
      {
        question: '¿Cómo recuperar contraseña?',
        answer: [
          'En la pantalla de inicio de sesión tienes la opción de recuperar tu acceso por correo. Solo debes pedir el enlace de restablecimiento y seguir las instrucciones que llegarán a tu bandeja de entrada.',
          'Si no ves el correo, revisa spam o correo no deseado antes de solicitarlo otra vez.',
        ],
      },
      {
        question: '¿Cómo borrar mi cuenta?',
        answer: [
          'Por ahora no hay un botón de autoeliminación dentro de la plataforma. Si quieres cerrar tu cuenta, escríbenos por el canal de contacto y te ayudamos con el proceso.',
          'También puedes actualizar tu perfil cuando quieras para mantener tus datos al día mientras usas la app.',
        ],
      },
    ],
  },
]

const quickSteps = [
  {
    icon: 'person_add',
    title: 'Crea tu cuenta',
    text: 'Regístrate con tu correo y verifica el acceso para empezar con tu perfil.',
  },
  {
    icon: 'assignment',
    title: 'Completa el cuestionario',
    text: 'Indica presupuesto, uso, estatura y preferencias para personalizar el resultado.',
  },
  {
    icon: 'recommend',
    title: 'Revisa recomendaciones',
    text: 'Abre las motos sugeridas y lee las razones y advertencias de compatibilidad.',
  },
  {
    icon: 'compare_arrows',
    title: 'Compara y guarda',
    text: 'Contrasta varias motos, marca favoritas y vuelve a ellas cuando quieras.',
  },
  {
    icon: 'calculate',
    title: 'Simula el costo real',
    text: 'Suma soat, matrícula y otros gastos antes de tomar la decisión final.',
  },
]

function normalizeText(value = '') {
  return String(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

export default function HelpFaqPage() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')

  const normalizedSearch = normalizeText(searchTerm.trim())

  const filteredCategories = useMemo(() => {
    if (!normalizedSearch) return faqCategories

    return faqCategories
      .map(category => {
        const questions = category.questions.filter(item => {
          const haystack = normalizeText(`${category.title} ${category.description} ${item.question} ${item.answer.join(' ')}`)
          return haystack.includes(normalizedSearch)
        })

        return questions.length > 0 ? { ...category, questions } : null
      })
      .filter(Boolean)
  }, [normalizedSearch])

  const totalQuestions = faqCategories.reduce((count, category) => count + category.questions.length, 0)
  const visibleQuestions = filteredCategories.reduce((count, category) => count + category.questions.length, 0)
  const questionCountLabel = normalizedSearch ? visibleQuestions : totalQuestions
  const hasResults = filteredCategories.length > 0

  return (
    <div className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(255,107,53,0.14),_transparent_30%),linear-gradient(180deg,#F8FAFC_0%,#EEF4FF_100%)] text-slate-900">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -right-24 top-16 h-72 w-72 rounded-full bg-[#0A2463]/10 blur-3xl" />
        <div className="absolute left-[-8rem] top-1/3 h-80 w-80 rounded-full bg-[#FF6B35]/10 blur-3xl" />
      </div>

      <main className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <section className="overflow-hidden rounded-[2rem] border border-white/60 bg-[#0A2463] text-white shadow-[0_30px_100px_rgba(10,36,99,0.28)]">
          <div className="grid gap-8 px-6 py-8 md:grid-cols-[1.25fr_0.75fr] md:px-10 md:py-10">
            <div className="space-y-6">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white/90 transition hover:bg-white/15"
              >
                <span className="material-symbols-outlined text-base">arrow_back</span>
                Volver
              </button>

              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white/90 backdrop-blur">
                <span className="material-symbols-outlined text-base">help_center</span>
                Centro de ayuda
              </div>

              <div className="space-y-4">
                <h1 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">❓ AYUDA Y FAQ</h1>
                <p className="max-w-2xl text-base leading-7 text-white/80 sm:text-lg">
                  Encuentra respuestas rápidas sobre MotorMatch, el cuestionario, las recomendaciones y la compra de tu moto.
                  Si no aparece tu duda, puedes escribirnos directamente.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/60">Categorías</p>
                  <p className="mt-2 text-2xl font-black">{faqCategories.length}</p>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/60">Preguntas</p>
                  <p className="mt-2 text-2xl font-black">{questionCountLabel}</p>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/60">Contacto</p>
                  <p className="mt-2 text-2xl font-black">24/7</p>
                </div>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-white/15 bg-white/8 p-6 backdrop-blur">
              <label className="block text-sm font-semibold text-white/80" htmlFor="faq-search">
                Buscar en preguntas frecuentes
              </label>
              <div className="relative mt-3">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/45">
                  <span className="material-symbols-outlined text-xl">search</span>
                </span>
                <input
                  id="faq-search"
                  type="search"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Busca por presupuesto, contraseña, precios..."
                  className="w-full rounded-2xl border border-white/10 bg-white/10 py-4 pl-12 pr-4 text-base text-white placeholder:text-white/45 outline-none transition focus:border-white/30 focus:bg-white/15"
                />
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <a
                  href={SUPPORT_MAILTO}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#FF6B35] px-4 py-3 text-sm font-bold text-white transition hover:brightness-110"
                >
                  <span className="material-symbols-outlined text-base">mail</span>
                  Escribir a soporte
                </a>
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/15"
                >
                  <span className="material-symbols-outlined text-base">restart_alt</span>
                  Limpiar búsqueda
                </button>
              </div>

              <div className="mt-5 rounded-2xl border border-white/10 bg-black/10 p-4 text-sm leading-6 text-white/75">
                Si escribes por correo, incluye el mismo email con el que te registraste para que podamos ayudarte más rápido.
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 flex gap-3 overflow-x-auto pb-2">
          {faqCategories.map(category => (
            <a
              key={category.id}
              href={`#${category.id}`}
              className="inline-flex shrink-0 items-center gap-2 rounded-full border border-slate-200/80 bg-white/90 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-[#FF6B35]/30 hover:text-[#FF6B35]"
            >
              <span className="material-symbols-outlined text-base">{category.icon}</span>
              {category.title}
            </a>
          ))}
        </section>

        <section className="mt-8 space-y-6">
          {hasResults ? (
            filteredCategories.map(category => (
              <article
                id={category.id}
                key={category.id}
                className="scroll-mt-28 rounded-[1.75rem] border border-slate-200/80 bg-white/90 p-5 shadow-sm backdrop-blur md:p-7"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                      <span className="material-symbols-outlined text-sm">{category.icon}</span>
                      {category.title}
                    </div>
                    <h2 className="mt-3 text-2xl font-black text-slate-900">{category.title}</h2>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 md:text-base">{category.description}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-500">
                    {category.questions.length} pregunta{category.questions.length === 1 ? '' : 's'}
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  {category.questions.map(item => (
                    <details
                      key={item.question}
                      className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:shadow-lg"
                    >
                      <summary className="flex list-none cursor-pointer items-center justify-between gap-4 px-5 py-4 text-left touch-manipulation select-none outline-none [&::-webkit-details-marker]:hidden focus-visible:ring-2 focus-visible:ring-[#FF6B35]/40">
                        <span className="text-base font-semibold leading-6 text-slate-900 md:text-lg">{item.question}</span>
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition group-open:rotate-45 group-open:bg-[#FF6B35]/10 group-open:text-[#FF6B35]">
                          <span className="material-symbols-outlined text-xl">add</span>
                        </span>
                      </summary>

                      <div className="border-t border-slate-100 px-5 pb-5 pt-4 md:px-6 md:pb-6">
                        {item.answer.map((paragraph, index) => (
                          <p key={index} className={`text-sm leading-7 text-slate-600 ${index > 0 ? 'mt-3' : ''}`}>
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    </details>
                  ))}
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white/90 p-8 text-center shadow-sm">
              <span className="material-symbols-outlined text-6xl text-slate-300">search_off</span>
              <h2 className="mt-4 text-2xl font-black text-slate-900">No encontramos resultados</h2>
              <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Prueba con otra palabra o limpia la búsqueda para volver a ver todas las preguntas.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0A2463] px-4 py-3 text-sm font-bold text-white transition hover:brightness-110"
                >
                  <span className="material-symbols-outlined text-base">restart_alt</span>
                  Limpiar búsqueda
                </button>
                <a
                  href={SUPPORT_MAILTO}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#FF6B35]/20 bg-[#FF6B35]/10 px-4 py-3 text-sm font-bold text-[#FF6B35] transition hover:bg-[#FF6B35]/15"
                >
                  <span className="material-symbols-outlined text-base">mail</span>
                  Escribir a soporte
                </a>
              </div>
            </div>
          )}
        </section>

        <section className="mt-10 rounded-[2rem] border border-slate-200/80 bg-white/90 p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-[#FF6B35]/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-[#FF6B35]">
                <span className="material-symbols-outlined text-sm">rocket_launch</span>
                Tutorial rápido
              </div>
              <h2 className="mt-3 text-2xl font-black text-slate-900">Empieza en minutos</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 md:text-base">
                Este flujo te lleva desde el registro hasta la decisión final, con menos dudas y más contexto.
              </p>
            </div>
            <a
              href={SUPPORT_MAILTO}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0A2463] px-4 py-3 text-sm font-bold text-white transition hover:brightness-110"
            >
              <span className="material-symbols-outlined text-base">help</span>
              Contacto por correo
            </a>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {quickSteps.map((step, index) => (
              <article
                key={step.title}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#FF6B35] shadow-sm">
                    <span className="material-symbols-outlined">{step.icon}</span>
                  </div>
                  <span className="rounded-full bg-[#0A2463]/10 px-3 py-1 text-xs font-black text-[#0A2463]">
                    0{index + 1}
                  </span>
                </div>
                <h3 className="mt-4 text-base font-black text-slate-900">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{step.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-10 grid gap-6 rounded-[2rem] border border-[#0A2463]/10 bg-[#0A2463] p-6 text-white shadow-[0_20px_80px_rgba(10,36,99,0.22)] md:grid-cols-[1fr_0.85fr] md:p-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-white/70">
              <span className="material-symbols-outlined text-sm">mail</span>
              ¿No resolviste tu duda?
            </div>
            <h2 className="text-2xl font-black">Escríbenos y te orientamos</h2>
              <p className="max-w-2xl text-sm leading-6 text-white/78 md:text-base">
              Si tu pregunta no aparece aquí, escríbenos a {SUPPORT_EMAIL} con una breve descripción de lo que estás intentando hacer.
              Te ayudaremos a encontrar la opción correcta dentro de la plataforma.
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-white/15 bg-white/10 p-5 backdrop-blur md:p-6">
            <h3 className="text-lg font-black">¿Qué puedes preguntar?</h3>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-white/80">
              <li>• Dudas sobre tu cuenta, acceso o recuperación de contraseña.</li>
              <li>• Cómo interpretar tus recomendaciones o advertencias.</li>
              <li>• Qué revisar antes de comprar una moto.</li>
              <li>• Problemas para navegar alguna sección de la app.</li>
            </ul>
            <a
              href={SUPPORT_MAILTO}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#FF6B35] px-4 py-3 text-sm font-bold text-white transition hover:brightness-110"
            >
              <span className="material-symbols-outlined text-base">send</span>
              Abrir correo
            </a>
          </div>
        </section>
      </main>
    </div>
  )
}
