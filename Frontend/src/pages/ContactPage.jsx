import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../shared/components/layout/header'
import { SUPPORT_EMAIL, SUPPORT_ROUTE, SUPPORT_SUBJECT } from '../shared/constants/support'

const CONTACT_METHODS = [
  {
    icon: 'mail',
    label: 'Correo principal',
    value: SUPPORT_EMAIL,
    helper: 'Ideal para dudas generales, soporte y seguimiento.',
  },
  {
    icon: 'location_on',
    label: 'Ubicación de referencia',
    value: 'Bogotá, Colombia',
    helper: 'MotorMatch opera con foco en el mercado colombiano.',
  },
  {
    icon: 'schedule',
    label: 'Atención esperada',
    value: 'Respuesta prioritaria',
    helper: 'Te orientamos lo antes posible desde los canales habilitados.',
  },
]

const SOCIAL_ITEMS = [
  { icon: 'public', label: 'Comunidad digital' },
  { icon: 'share', label: 'Difusión del proyecto' },
  { icon: 'forum', label: 'Conversación abierta' },
]

function buildMailtoLink(subject, body) {
  const query = new URLSearchParams({
    subject,
    body,
  })

  return `mailto:${SUPPORT_EMAIL}?${query.toString()}`
}

export default function ContactPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    email: '',
    message: '',
  })
  const [showSuccess, setShowSuccess] = useState(false)

  const canSubmit = form.name.trim() && form.email.trim() && form.message.trim()

  const mailtoLink = useMemo(
    () => buildMailtoLink(
      SUPPORT_SUBJECT,
      `Nombre: ${form.name || '[Tu nombre]'}\nCorreo: ${form.email || '[Tu correo]'}\n\nMensaje:\n${form.message || '[Escribe aquí tu mensaje]'}`
    ),
    [form.email, form.message, form.name],
  )

  const handleChange = (field) => (event) => {
    setForm((current) => ({
      ...current,
      [field]: event.target.value,
    }))
  }

  const handleSubmit = () => {
    if (!canSubmit) return

    window.location.href = mailtoLink
    setShowSuccess(true)
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[linear-gradient(180deg,#F5F7FA_0%,#EEF3FB_45%,#F7F9FC_100%)] text-slate-900">
      <Header sticky={false} />

      <main className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-10">
        <section className="relative overflow-hidden rounded-[2rem] bg-[#0A2463] px-6 py-10 text-white shadow-[0_30px_100px_rgba(10,36,99,0.28)] md:px-10 md:py-14">
          <div className="absolute inset-0">
            <div className="absolute right-0 top-0 h-72 w-72 translate-x-1/4 -translate-y-1/4 rounded-full bg-[#FF6B35]/15 blur-3xl" />
            <div className="absolute left-0 top-1/2 h-80 w-80 -translate-x-1/3 -translate-y-1/2 rounded-full bg-white/10 blur-3xl" />
          </div>

          <div className="relative z-10 max-w-3xl">
            <p className="text-[11px] font-black uppercase tracking-[0.34em] text-white/65">Contacto MotorMatch</p>
            <h1 className="mt-4 text-4xl font-black tracking-tight md:text-6xl">Hablemos de tu próxima decisión sobre dos ruedas.</h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/80 md:text-lg">
              Si tienes preguntas sobre la plataforma, el proyecto o el flujo de recomendación, este espacio te permite escribirnos con una experiencia más clara y coherente con el resto del sistema.
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
                onClick={() => navigate(SUPPORT_ROUTE)}
                className="rounded-2xl border border-white/20 bg-white/10 px-6 py-3 text-sm font-black uppercase tracking-[0.18em] text-white transition hover:bg-white/15"
              >
                Ir a soporte
              </button>
            </div>
          </div>
        </section>

        <section className="mt-12 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <div className="mb-8">
              <p className="text-[11px] font-black uppercase tracking-[0.32em] text-[#FF6B35]">Formulario de contacto</p>
              <h2 className="mt-2 text-3xl font-black text-[#0A2463]">Envíanos un mensaje</h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">
                Completa los datos básicos y te abrimos tu cliente de correo con el mensaje listo para enviar. Así mantenemos una experiencia simple y directa.
              </p>
            </div>

            {showSuccess && (
              <div className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4">
                <span className="material-symbols-outlined text-emerald-500">check_circle</span>
                <div>
                  <p className="text-sm font-bold text-emerald-700">Tu mensaje ya está listo para enviarse.</p>
                  <p className="mt-1 text-sm leading-6 text-emerald-700/85">
                    Si tu correo no se abrió automáticamente, puedes usar el botón de envío nuevamente o escribirnos directo a {SUPPORT_EMAIL}.
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-xs font-black uppercase tracking-[0.24em] text-slate-500">Nombre completo</span>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">person</span>
                    <input
                      type="text"
                      value={form.name}
                      onChange={handleChange('name')}
                      placeholder="Juan García"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-4 text-sm text-slate-800 outline-none transition focus:border-[#FF6B35]"
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="mb-2 block text-xs font-black uppercase tracking-[0.24em] text-slate-500">Correo electrónico</span>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">mail</span>
                    <input
                      type="email"
                      value={form.email}
                      onChange={handleChange('email')}
                      placeholder="tu@correo.com"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-4 text-sm text-slate-800 outline-none transition focus:border-[#FF6B35]"
                    />
                  </div>
                </label>
              </div>

              <label className="block">
                <span className="mb-2 block text-xs font-black uppercase tracking-[0.24em] text-slate-500">Tu mensaje</span>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-4 text-slate-400">edit</span>
                  <textarea
                    rows={6}
                    value={form.message}
                    onChange={handleChange('message')}
                    placeholder="Cuéntanos cómo podemos ayudarte con MotorMatch..."
                    className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-4 text-sm text-slate-800 outline-none transition focus:border-[#FF6B35]"
                  />
                </div>
              </label>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  className="inline-flex items-center gap-2 rounded-2xl bg-[#FF6B35] px-6 py-3 text-sm font-black uppercase tracking-[0.18em] text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span>Enviar mensaje</span>
                  <span className="material-symbols-outlined text-base">send</span>
                </button>

                <a
                  href={mailtoLink}
                  className="inline-flex items-center gap-2 rounded-2xl border border-[#0A2463]/15 bg-[#0A2463]/5 px-6 py-3 text-sm font-black uppercase tracking-[0.18em] text-[#0A2463] transition hover:bg-[#0A2463]/10"
                >
                  Abrir correo
                </a>
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-[2rem] bg-[#0A2463] p-6 text-white shadow-[0_24px_80px_rgba(10,36,99,0.22)] md:p-8">
              <p className="text-[11px] font-black uppercase tracking-[0.3em] text-white/60">Canales</p>
              <h2 className="mt-2 text-2xl font-black">Información de contacto</h2>

              <div className="mt-6 space-y-5">
                {CONTACT_METHODS.map((item) => (
                  <article key={item.label} className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/10 px-4 py-4 backdrop-blur">
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-[#FF6B35]">
                      <span className="material-symbols-outlined">{item.icon}</span>
                    </span>
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-[0.22em] text-white/55">{item.label}</p>
                      <p className="mt-1 text-sm font-bold text-white">{item.value}</p>
                      <p className="mt-1 text-sm leading-6 text-white/72">{item.helper}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
              <p className="text-[11px] font-black uppercase tracking-[0.3em] text-[#FF6B35]">Red y comunidad</p>
              <h2 className="mt-2 text-2xl font-black text-[#0A2463]">Sigue la conversación</h2>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                MotorMatch también se piensa como una experiencia de comunidad, aprendizaje y acompañamiento en el proceso de compra.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                {SOCIAL_ITEMS.map((item) => (
                  <div
                    key={item.label}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-600"
                  >
                    <span className="material-symbols-outlined text-base text-[#0A2463]">{item.icon}</span>
                    {item.label}
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-[1.5rem] bg-slate-50 p-5">
                <p className="text-sm italic leading-7 text-slate-500">
                  "La mejor decisión no siempre es la moto más llamativa, sino la que realmente encaja contigo."
                </p>
              </div>
            </div>
          </aside>
        </section>

        <section className="mt-12 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.3em] text-[#FF6B35]">Acceso rápido</p>
              <h2 className="mt-2 text-2xl font-black text-[#0A2463]">¿Prefieres seguir explorando antes de escribirnos?</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
                Puedes volver al catálogo, revisar ayuda o seguir comparando motos antes de contactarnos.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => navigate('/catalogo')}
                className="rounded-2xl bg-[#0A2463] px-5 py-3 text-sm font-black uppercase tracking-[0.18em] text-white transition hover:brightness-110"
              >
                Ver catálogo
              </button>
              <button
                type="button"
                onClick={() => navigate('/ayuda')}
                className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-black uppercase tracking-[0.18em] text-slate-600 transition hover:bg-slate-50"
              >
                Ayuda y FAQ
              </button>
            </div>
          </div>
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
