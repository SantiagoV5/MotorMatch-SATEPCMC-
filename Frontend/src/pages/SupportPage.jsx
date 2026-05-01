import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import apiClient from '../services/apiClient'
import { SUPPORT_EMAIL, SUPPORT_ROUTE, SUPPORT_SUBJECT } from '../shared/constants/support'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function readStoredUser() {
  try {
    return JSON.parse(sessionStorage.getItem('mm_user') || 'null')
  } catch {
    return null
  }
}

function resolveReturnPath() {
  const fallback = sessionStorage.getItem('mm_token') ? '/home' : '/login'

  if (typeof document === 'undefined' || !document.referrer) {
    return fallback
  }

  try {
    const referrerUrl = new URL(document.referrer)

    if (referrerUrl.origin !== window.location.origin) {
      return fallback
    }

    const referrerPath = `${referrerUrl.pathname}${referrerUrl.search}${referrerUrl.hash}`
    return referrerPath && referrerPath !== SUPPORT_ROUTE ? referrerPath : fallback
  } catch {
    return fallback
  }
}

export default function SupportPage() {
  const navigate = useNavigate()
  const redirectTimer = useRef(null)
  const user = useMemo(readStoredUser, [])
  const returnTo = useMemo(resolveReturnPath, [])

  const [form, setForm] = useState(() => ({
    name: user?.name || '',
    email: user?.email || '',
    message: '',
  }))
  const [status, setStatus] = useState('idle')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    return () => {
      if (redirectTimer.current) {
        window.clearTimeout(redirectTimer.current)
      }
    }
  }, [])

  const canSubmit = form.name.trim().length >= 2 && EMAIL_RE.test(form.email) && form.message.trim().length >= 10

  const handleChange = event => {
    const { name, value } = event.target
    setForm(previous => ({ ...previous, [name]: value }))
  }

  const handleSubmit = async event => {
    event.preventDefault()

    if (!canSubmit || status === 'sending') {
      return
    }

    setStatus('sending')
    setErrorMessage('')

    try {
      await apiClient.post('/support', {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        message: form.message.trim(),
        sourcePage: returnTo,
      })

      setStatus('success')
      redirectTimer.current = window.setTimeout(() => {
        navigate(returnTo, { replace: true })
      }, 1400)
    } catch (error) {
      setStatus('error')
      setErrorMessage(error.response?.data?.message || 'No pudimos enviar tu mensaje. Intenta de nuevo.')
    }
  }

  const handleBack = () => {
    navigate(returnTo, { replace: true })
  }

  return (
    <div className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(255,107,53,0.14),_transparent_30%),linear-gradient(180deg,#F8FAFC_0%,#EEF4FF_100%)] text-slate-900">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -right-24 top-16 h-72 w-72 rounded-full bg-[#0A2463]/10 blur-3xl" />
        <div className="absolute left-[-8rem] top-1/3 h-80 w-80 rounded-full bg-[#FF6B35]/10 blur-3xl" />
      </div>

      <main className="relative mx-auto flex min-h-screen max-w-5xl items-center px-4 py-8 sm:px-6 lg:px-8">
        <section className="grid w-full gap-8 overflow-hidden rounded-[2rem] border border-white/60 bg-white/90 p-6 shadow-[0_30px_100px_rgba(10,36,99,0.18)] backdrop-blur md:grid-cols-[0.95fr_1.05fr] md:p-8">
          <aside className="rounded-[1.75rem] bg-[#0A2463] p-6 text-white shadow-[0_20px_60px_rgba(10,36,99,0.28)] md:p-8">
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white/90 transition hover:bg-white/15"
            >
              <span className="material-symbols-outlined text-base">arrow_back</span>
              Volver
            </button>

            <div className="mt-8 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white/90 backdrop-blur">
              <span className="material-symbols-outlined text-base">support_agent</span>
              Centro de soporte
            </div>

            <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">Escríbenos sin salir de MotorMatch</h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-white/80">
              Envía tu mensaje desde aquí y volverás automáticamente a la pantalla anterior cuando termine el envío.
            </p>

            <div className="mt-8 rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/60">Destino del correo</p>
              <p className="mt-3 text-lg font-black">{SUPPORT_EMAIL}</p>
              <p className="mt-2 text-sm leading-6 text-white/75">
                Tu mensaje se registra como correo de soporte y el equipo podrá responderte directamente.
              </p>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/60">Asunto</p>
                <p className="mt-2 text-sm font-semibold text-white/90">{SUPPORT_SUBJECT}</p>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/60">Retorno</p>
                <p className="mt-2 text-sm font-semibold text-white/90">Automático</p>
              </div>
            </div>
          </aside>

          <section className="rounded-[1.75rem] border border-slate-200/80 bg-white p-6 shadow-sm md:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-[#FF6B35]/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-[#FF6B35]">
                  <span className="material-symbols-outlined text-sm">mail</span>
                  Soporte MotorMatch
                </div>
                <h2 className="mt-3 text-2xl font-black text-slate-900">Cuéntanos qué necesitas</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                  Completa el formulario y enviaremos tu mensaje por correo. Cuando termine, regresarás al sitio automáticamente.
                </p>
              </div>

              <span className="hidden rounded-full bg-[#0A2463]/5 px-4 py-2 text-xs font-bold uppercase tracking-widest text-[#0A2463] md:inline-flex">
                Paso único
              </span>
            </div>

            {status === 'success' ? (
              <div className="mt-8 rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-6 text-emerald-900">
                <div className="flex items-start gap-4">
                  <span className="material-symbols-outlined text-3xl text-emerald-600">check_circle</span>
                  <div>
                    <h3 className="text-lg font-black">Mensaje enviado</h3>
                    <p className="mt-2 text-sm leading-6 text-emerald-800">
                      Ya puedes volver a MotorMatch. Te redirigimos automáticamente.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="support-name">
                      Nombre
                    </label>
                    <input
                      id="support-name"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      type="text"
                      placeholder="Tu nombre"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 outline-none transition focus:border-[#FF6B35]/40 focus:bg-white focus:ring-4 focus:ring-[#FF6B35]/10"
                      autoComplete="name"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="support-email">
                      Correo electrónico
                    </label>
                    <input
                      id="support-email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      type="email"
                      placeholder="tu-correo@dominio.com"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 outline-none transition focus:border-[#FF6B35]/40 focus:bg-white focus:ring-4 focus:ring-[#FF6B35]/10"
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="support-message">
                    Mensaje
                  </label>
                  <textarea
                    id="support-message"
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    rows={8}
                    placeholder="Cuéntanos con detalle qué te ocurre o qué necesitas resolver."
                    className="w-full rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 outline-none transition focus:border-[#FF6B35]/40 focus:bg-white focus:ring-4 focus:ring-[#FF6B35]/10"
                    required
                  />
                  <p className="mt-2 text-xs text-slate-500">
                    Mínimo 10 caracteres. Mientras más detalle incluyas, más fácil será ayudarte.
                  </p>
                </div>

                {status === 'error' && (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                    {errorMessage}
                  </div>
                )}

                <div className="flex flex-col gap-3 pt-1 sm:flex-row">
                  <button
                    type="submit"
                    disabled={!canSubmit || status === 'sending'}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#FF6B35] px-5 py-4 text-sm font-black uppercase tracking-widest text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <span className="material-symbols-outlined text-base">send</span>
                    {status === 'sending' ? 'Enviando...' : 'Enviar mensaje'}
                  </button>

                  <button
                    type="button"
                    onClick={handleBack}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-black uppercase tracking-widest text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                  >
                    <span className="material-symbols-outlined text-base">arrow_back</span>
                    Volver
                  </button>
                </div>
              </form>
            )}
          </section>
        </section>
      </main>
    </div>
  )
}