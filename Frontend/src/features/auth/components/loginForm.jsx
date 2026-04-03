import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthSidePanel from './AuthSidePanel'
import useAuth from '../hooks/useAuth'
import apiClient from '../../../services/apiClient'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail]               = useState('')
  const [password, setPassword]         = useState('')
  const [touched, setTouched]           = useState({})
  const navigate                        = useNavigate()
  const { login, loading, error }       = useAuth()

  // ── Forgot password modal ──────────────────────────────────────────────────
  const [showForgot, setShowForgot]         = useState(false)
  const [forgotEmail, setForgotEmail]       = useState('')
  const [forgotLoading, setForgotLoading]   = useState(false)
  const [forgotStatus, setForgotStatus]     = useState(null) // 'sent' | 'error'
  const [forgotMsg, setForgotMsg]           = useState('')

  async function handleForgotSubmit(e) {
    e.preventDefault()
    if (!EMAIL_RE.test(forgotEmail)) return
    setForgotLoading(true)
    setForgotStatus(null)
    try {
      const { data } = await apiClient.post('/auth/forgot-password', { email: forgotEmail })
      setForgotStatus('sent')
      setForgotMsg(data.message)
    } catch (err) {
      setForgotStatus('error')
      setForgotMsg(err.response?.data?.message || 'Ocurrió un error. Intenta de nuevo.')
    } finally {
      setForgotLoading(false)
    }
  }

  function closeForgot() {
    setShowForgot(false)
    setForgotEmail('')
    setForgotStatus(null)
    setForgotMsg('')
  }

  function touch(field) { setTouched(p => ({ ...p, [field]: true })) }

  const emailError    = touched.email    && !EMAIL_RE.test(email)  ? 'Ingresa un correo electronico valido' : ''
  const passwordError = touched.password && !password               ? 'La contraseña es obligatoria'        : ''

  async function handleSubmit(e) {
    e.preventDefault()
    setTouched({ email: true, password: true })
    if (!EMAIL_RE.test(email) || !password) return
    try {
      await login(email, password)
      navigate('/')
    } catch {
      // el error queda capturado en useAuth().error
    }
  }

  function inputCls(hasErr) {
    return [
      'w-full pl-12 py-3 rounded-lg border',
      hasErr
        ? 'border-red-400 focus:ring-red-200 focus:border-red-400'
        : 'border-slate-200 dark:border-slate-800 focus:ring-primary/20 focus:border-primary',
      'bg-slate-50 dark:bg-slate-800 focus:ring-2 outline-none transition-all dark:text-white',
    ].join(' ')
  }

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen flex items-center justify-center p-4">

      {/* ── Forgot password modal ────────────────────────────────────────────── */}
      {showForgot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md p-8 flex flex-col gap-5 border border-slate-100 dark:border-slate-700">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-xl font-bold text-neutral-dark dark:text-slate-100">Recuperar contraseña</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Ingresa tu correo y te enviaremos un enlace de recuperación válido por 10 minutos.
                </p>
              </div>
              <button onClick={closeForgot} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors" aria-label="Cerrar">
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            {forgotStatus === 'sent' ? (
              <div className="flex flex-col items-center gap-4 py-4 text-center">
                <span className="material-symbols-outlined text-5xl text-green-500">mark_email_read</span>
                <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">{forgotMsg}</p>
                <button onClick={closeForgot} className="mt-2 px-6 py-2.5 bg-primary text-white rounded-lg font-bold text-sm hover:bg-primary/90 transition-colors">
                  Cerrar
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-semibold text-neutral-dark dark:text-slate-300 mb-1.5">
                    Correo electrónico
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">mail</span>
                    <input
                      type="email"
                      placeholder="ejemplo@motormatch.com"
                      value={forgotEmail}
                      onChange={e => setForgotEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all dark:text-white"
                      required
                    />
                  </div>
                </div>
                {forgotStatus === 'error' && (
                  <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3">
                    {forgotMsg}
                  </p>
                )}
                <div className="flex gap-3 mt-1">
                  <button type="button" onClick={closeForgot}
                    className="flex-1 py-3 rounded-lg border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold hover:border-slate-400 transition-all">
                    Cancelar
                  </button>
                  <button type="submit" disabled={forgotLoading || !EMAIL_RE.test(forgotEmail)}
                    className="flex-1 py-3 rounded-lg bg-primary text-white font-bold hover:bg-primary/90 transition-all disabled:opacity-60 disabled:cursor-not-allowed">
                    {forgotLoading ? 'Enviando...' : 'Enviar enlace'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <div className="w-full max-w-[1200px] h-[850px] flex overflow-hidden rounded-xl shadow-2xl bg-white dark:bg-slate-900">

        {/* Panel izquierdo compartido */}
        <AuthSidePanel description="Encuentra la motocicleta perfecta que se adapte a tu estilo de vida y pasion por la carretera." />

        {/* Panel derecho: formulario */}
        <div className="w-full lg:w-1/2 flex flex-col p-8 md:p-12 bg-white dark:bg-slate-900 overflow-y-auto">

          {/* Encabezado */}
          <div className="mb-8">
            <h3 className="text-3xl font-bold text-neutral-dark dark:text-slate-100 mb-2">
              Bienvenido de nuevo
            </h3>
            <p className="text-slate-500 dark:text-slate-400">
              Ingresa a tu cuenta para gestionar tus motos favoritas.
            </p>
          </div>

          {/* Tabs de navegacion */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 mb-8">
            <button className="flex-1 pb-4 text-sm font-bold border-b-2 border-primary text-primary tracking-wide">
              INICIAR SESION
            </button>
            <button
              type="button"
              onClick={() => navigate('/register')}
              className="flex-1 pb-4 text-sm font-bold border-b-2 border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors tracking-wide"
            >
              REGISTRARSE
            </button>
          </div>

          {/* Formulario */}
          <form className="space-y-4" onSubmit={handleSubmit}>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-neutral-dark dark:text-slate-300 mb-1.5">
                Correo Electronico
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">mail</span>
                <input
                  type="email"
                  placeholder="ejemplo@motormatch.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => touch('email')}
                  className={inputCls(!!emailError) + ' pr-4'}
                />
              </div>
              <p className="mt-1 h-4 text-xs text-red-500">{emailError}</p>
            </div>

            {/* Contrasena */}
            <div>
              <label className="block text-sm font-semibold text-neutral-dark dark:text-slate-300 mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">lock</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="xxxxxxxxxx"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => touch('password')}
                  className={inputCls(!!passwordError) + ' pr-12'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  <span className="material-symbols-outlined">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
              <p className="mt-1 h-4 text-xs text-red-500">{passwordError}</p>
            </div>

            {/* Recordarme + Olvidaste */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" className="size-4 rounded border-slate-300 text-primary focus:ring-primary" />
                <span className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-neutral-dark transition-colors">Recordarme</span>
              </label>
              <button type="button" onClick={() => setShowForgot(true)} className="text-sm font-medium text-accent hover:underline">¿Olvidaste tu contraseña?</button>
            </div>

            {/* Error del servidor */}
            {error && (
              <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3">
                {error}
              </p>
            )}

            {/* Boton submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-primary text-white rounded-lg font-bold text-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 tracking-wider disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'INGRESANDO...' : 'INGRESAR'}
            </button>
          </form>

          {/* Divisor decorativo */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800" />
            </div>
          </div>

          {/* Footer */}
          <div className="mt-auto text-center">
            <p className="text-sm text-slate-500">
              Aun no eres parte de la comunidad?{' '}
              <button
                type="button"
                onClick={() => navigate('/register')}
                className="text-primary font-bold hover:underline"
              >
                Crea una cuenta gratis
              </button>
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}

export default LoginForm
