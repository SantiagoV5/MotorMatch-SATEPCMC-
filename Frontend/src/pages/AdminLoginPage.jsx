import { useMemo, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import AuthSidePanel from '../features/auth/components/AuthSidePanel'
import useAuth from '../features/auth/hooks/useAuth'

function AdminLoginPage() {
  const navigate = useNavigate()
  const { user, login, isAuthenticated } = useAuth()
  const [password, setPassword] = useState('')
  const [touched, setTouched] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const email = user?.email || user?.mail || ''

  const passwordError = useMemo(() => {
    if (!touched) return ''
    if (!password.trim()) return 'La contraseña del administrador es obligatoria'
    return ''
  }, [password, touched])

  if (!isAuthenticated || !user?.isAdmin) {
    return <Navigate to="/login" replace />
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setTouched(true)
    setError('')

    if (!password.trim()) return

    try {
      setSubmitting(true)
      const rememberMe = localStorage.getItem('mm_remember') === 'true'
      const data = await login(email, password, rememberMe)
      if (!data.user?.isAdmin) {
        setError('No se pudo confirmar el acceso de administrador')
        return
      }

      navigate('/admin', { replace: true })
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo validar el acceso de administrador')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-[1200px] min-h-[780px] flex overflow-hidden rounded-xl shadow-2xl bg-white dark:bg-slate-900">
        <AuthSidePanel description="Confirma tu identidad para entrar al panel exclusivo de administración de MotorMatch." />

        <div className="w-full lg:w-1/2 flex flex-col p-8 md:p-12 bg-white dark:bg-slate-900 overflow-y-auto">
          <div className="mb-8">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#FF6B35] mb-3">Acceso administrativo</p>
            <h3 className="text-3xl font-bold text-neutral-dark dark:text-slate-100 mb-2">
              Confirma tu contraseña
            </h3>
            <p className="text-slate-500 dark:text-slate-400">
              Reingresa tu contraseña para continuar con la sesión administrativa.
            </p>
          </div>

          <div className="mb-8 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300">
            Verificación para <span className="font-bold text-primary dark:text-slate-100">{email}</span>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-semibold text-neutral-dark dark:text-slate-300 mb-1.5">
                Contraseña de administrador
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">lock</span>
                <input
                  type="password"
                  placeholder="Ingresa tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => setTouched(true)}
                  className={`w-full pl-12 pr-4 py-3 rounded-lg border bg-slate-50 dark:bg-slate-800 focus:ring-2 outline-none transition-all dark:text-white ${passwordError ? 'border-red-400 focus:ring-red-200 focus:border-red-400' : 'border-slate-200 dark:border-slate-700 focus:ring-primary/20 focus:border-primary'}`}
                />
              </div>
              <p className="mt-1 h-4 text-xs text-red-500">{passwordError}</p>
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="flex-1 rounded-lg border-2 border-slate-200 px-4 py-3 text-sm font-bold text-slate-600 transition-all hover:border-slate-400"
              >
                Volver al inicio
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 rounded-lg bg-primary px-4 py-3 text-sm font-bold text-white transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? 'Validando...' : 'Entrar al panel'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AdminLoginPage