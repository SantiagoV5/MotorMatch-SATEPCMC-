import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import AuthSidePanel from '../features/auth/components/AuthSidePanel'
import apiClient from '../features/auth/services/../../../services/apiClient'

const PASSWORD_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{6,}$/

function Rule({ ok, text }) {
  return (
    <li className={`flex items-center gap-2 text-xs transition-colors ${ok ? 'text-green-600' : 'text-slate-400'}`}>
      <span className="material-symbols-outlined text-sm">{ok ? 'check_circle' : 'radio_button_unchecked'}</span>
      {text}
    </li>
  )
}

export default function ResetPasswordPage() {
  const navigate              = useNavigate()
  const [params]              = useSearchParams()
  const token                 = params.get('token') || ''

  const [password, setPassword]   = useState('')
  const [confirm, setConfirm]     = useState('')
  const [showPwd, setShowPwd]     = useState(false)
  const [showCfm, setShowCfm]     = useState(false)
  const [loading, setLoading]     = useState(false)
  const [status, setStatus]       = useState(null) // 'success' | 'expired' | 'error'
  const [msg, setMsg]             = useState('')

  // If no token, redirect immediately
  useEffect(() => {
    if (!token) navigate('/login', { replace: true })
  }, [token])

  const rules = {
    length:  password.length >= 6,
    lower:   /[a-z]/.test(password),
    upper:   /[A-Z]/.test(password),
    number:  /\d/.test(password),
    symbol:  /[^A-Za-z\d]/.test(password),
    match:   password === confirm && confirm.length > 0,
  }
  const allValid = Object.values(rules).every(Boolean)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!allValid) return
    setLoading(true)
    try {
      const { data } = await apiClient.post('/auth/reset-password', { token, password })
      setStatus('success')
      setMsg(data.message)
    } catch (err) {
      const code = err.response?.status
      if (code === 410 || err.response?.data?.message?.includes('expirado')) {
        setStatus('expired')
        setMsg('Este enlace ha expirado. Solicita uno nuevo desde la página de inicio de sesión.')
      } else {
        setStatus('error')
        setMsg(err.response?.data?.message || 'Ocurrió un error. Intenta de nuevo.')
      }
    } finally {
      setLoading(false)
    }
  }

  function inputCls(hasErr) {
    return [
      'w-full pl-12 py-3 rounded-lg border',
      hasErr
        ? 'border-red-400 focus:ring-red-200 focus:border-red-400'
        : 'border-slate-200 dark:border-slate-800 focus:ring-primary/20 focus:border-primary',
      'bg-slate-50 dark:bg-slate-800 focus:ring-2 outline-none transition-all dark:text-white pr-12',
    ].join(' ')
  }

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-[1200px] h-[850px] flex overflow-hidden rounded-xl shadow-2xl bg-white dark:bg-slate-900">

        <AuthSidePanel description="Crea una nueva contraseña segura para proteger tu cuenta en MotorMatch." />

        <div className="w-full lg:w-1/2 flex flex-col p-8 md:p-12 bg-white dark:bg-slate-900 overflow-y-auto">

          <div className="mb-8">
            <h3 className="text-3xl font-bold text-neutral-dark dark:text-slate-100 mb-2">
              Nueva contraseña
            </h3>
            <p className="text-slate-500 dark:text-slate-400">
              Elige una contraseña segura para tu cuenta.
            </p>
          </div>

          {/* Expired state */}
          {status === 'expired' && (
            <div className="flex flex-col items-center gap-5 py-8 text-center">
              <span className="material-symbols-outlined text-6xl text-amber-500">schedule</span>
              <h4 className="text-xl font-bold text-neutral-dark dark:text-slate-100">Enlace expirado</h4>
              <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xs leading-relaxed">{msg}</p>
              <button
                onClick={() => navigate('/login')}
                className="mt-2 px-8 py-3 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 transition-all"
              >
                Ir al inicio de sesión
              </button>
            </div>
          )}

          {/* Success state */}
          {status === 'success' && (
            <div className="flex flex-col items-center gap-5 py-8 text-center">
              <span className="material-symbols-outlined text-6xl text-green-500">lock_reset</span>
              <h4 className="text-xl font-bold text-neutral-dark dark:text-slate-100">¡Contraseña actualizada!</h4>
              <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xs leading-relaxed">
                Tu contraseña ha sido actualizada exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="mt-2 px-8 py-3 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 transition-all"
              >
                Iniciar sesión
              </button>
            </div>
          )}

          {/* Form */}
          {!status && (
            <form className="space-y-5" onSubmit={handleSubmit}>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-neutral-dark dark:text-slate-300 mb-1.5">
                  Nueva contraseña
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">lock</span>
                  <input
                    type={showPwd ? 'text' : 'password'}
                    placeholder="Mínimo 6 caracteres"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className={inputCls(false)}
                  />
                  <button type="button" onClick={() => setShowPwd(p => !p)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors">
                    <span className="material-symbols-outlined">{showPwd ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
              </div>

              {/* Confirm */}
              <div>
                <label className="block text-sm font-semibold text-neutral-dark dark:text-slate-300 mb-1.5">
                  Confirmar contraseña
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">lock_clock</span>
                  <input
                    type={showCfm ? 'text' : 'password'}
                    placeholder="Repite la contraseña"
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    className={inputCls(confirm.length > 0 && !rules.match)}
                  />
                  <button type="button" onClick={() => setShowCfm(p => !p)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors">
                    <span className="material-symbols-outlined">{showCfm ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
              </div>

              {/* Rules */}
              <ul className="space-y-1.5 pt-1">
                <Rule ok={rules.length}  text="Mínimo 6 caracteres" />
                <Rule ok={rules.lower}   text="Al menos una minúscula" />
                <Rule ok={rules.upper}   text="Al menos una mayúscula" />
                <Rule ok={rules.number}  text="Al menos un número" />
                <Rule ok={rules.symbol}  text="Al menos un símbolo (!@#$...)" />
                <Rule ok={rules.match}   text="Las contraseñas coinciden" />
              </ul>

              {status === 'error' && (
                <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3">
                  {msg}
                </p>
              )}

              <button
                type="submit"
                disabled={!allValid || loading}
                className="w-full py-4 bg-primary text-white rounded-lg font-bold text-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 tracking-wider disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? 'ACTUALIZANDO...' : 'ACTUALIZAR CONTRASEÑA'}
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  )
}
