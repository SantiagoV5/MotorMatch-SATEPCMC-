import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthSidePanel from './AuthSidePanel'
import useAuth from '../hooks/useAuth'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validate({ name, email, password, confirmPassword }) {
  const errs = {}
  if (!name || name.trim().length < 2)
    errs.name = 'El nombre debe tener al menos 2 caracteres'
  else if (name.trim().length > 80)
    errs.name = 'El nombre no puede superar 80 caracteres'

  if (!email || !EMAIL_RE.test(email))
    errs.email = 'Ingresa un correo electronico valido'

  if (!password || password.length < 8)
    errs.password = 'La contraseña debe tener al menos 8 caracteres'

  if (!confirmPassword)
    errs.confirmPassword = 'Por favor confirma tu contraseña'
  else if (password !== confirmPassword)
    errs.confirmPassword = 'Las contraseñas no coinciden'

  return errs
}

function RegisterForm() {
  const [showPassword, setShowPassword]               = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [name, setName]                   = useState('')
  const [email, setEmail]                 = useState('')
  const [password, setPassword]           = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [touched, setTouched]             = useState({})
  const [emailSent, setEmailSent]         = useState(false)
  const [sentTo, setSentTo]               = useState('')
  const navigate                          = useNavigate()
  const { register, loading, error }      = useAuth()

  const fieldErrors = validate({ name, email, password, confirmPassword })

  function touch(field) { setTouched(p => ({ ...p, [field]: true })) }
  function showErr(field) { return touched[field] ? (fieldErrors[field] || '') : '' }

  function inputCls(field, extraPr = 'pr-4') {
    const hasErr = touched[field] && fieldErrors[field]
    return [
      'w-full pl-12',
      extraPr,
      'py-3 rounded-lg border',
      hasErr
        ? 'border-red-400 focus:ring-red-200 focus:border-red-400'
        : 'border-slate-200 dark:border-slate-800 focus:ring-primary/20 focus:border-primary',
      'bg-slate-50 dark:bg-slate-800 focus:ring-2 outline-none transition-all dark:text-white',
    ].join(' ')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    // Mostrar todos los errores si el usuario intentó enviar sin completar
    setTouched({ name: true, email: true, password: true, confirmPassword: true })
    if (Object.keys(fieldErrors).length > 0) return
    try {
      await register(name, email, password)
      setSentTo(email)
      setEmailSent(true)
    } catch {
      // el error queda capturado en useAuth().error
    }
  }

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark p-4">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-xl shadow-2xl p-10 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-4xl text-primary">mark_email_read</span>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-3">¡Revisa tu correo!</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
            Te enviamos un enlace de verificación a<br />
            <span className="font-semibold text-primary">{sentTo}</span>.<br /><br />
            Haz clic en el enlace del correo para activar tu cuenta.
            El enlace expira en 24 horas.
          </p>
          <p className="mt-6 text-xs text-slate-400">
            ¿No lo ves? Revisa la carpeta de spam o{' '}
            <button
              type="button"
              onClick={() => { setEmailSent(false); setSentTo('') }}
              className="text-primary font-semibold hover:underline"
            >
              vuelve a intentarlo
            </button>.
          </p>
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="mt-8 w-full py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors"
          >
            Ir al inicio de sesión
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-[1200px] h-[850px] flex overflow-hidden rounded-xl shadow-2xl bg-white dark:bg-slate-900">

        {/* Panel izquierdo compartido */}
        <AuthSidePanel description="Unete a la comunidad de motociclistas mas grande y encuentra tu companera de ruta ideal." />

        {/* Panel derecho: formulario */}
        <div className="w-full lg:w-1/2 flex flex-col p-8 md:p-12 bg-white dark:bg-slate-900 overflow-y-auto">

          {/* Encabezado */}
          <div className="mb-8">
            <h3 className="text-3xl font-bold text-neutral-dark dark:text-slate-100 mb-2">
              Crear Cuenta
            </h3>
            <p className="text-slate-500 dark:text-slate-400">
              Registrate para empezar a explorar el mundo de las dos ruedas.
            </p>
          </div>

          {/* Tabs de navegacion */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 mb-8">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="flex-1 pb-4 text-sm font-bold border-b-2 border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors tracking-wide"
            >
              INICIAR SESION
            </button>
            <button className="flex-1 pb-4 text-sm font-bold border-b-2 border-primary text-primary tracking-wide">
              REGISTRARSE
            </button>
          </div>

          {/* Formulario */}
          <form className="space-y-3" onSubmit={handleSubmit}>

            {/* Nombre */}
            <div>
              <label className="block text-sm font-semibold text-neutral-dark dark:text-slate-300 mb-1.5">
                Nombre Completo
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">person</span>
                <input
                  type="text"
                  placeholder="Juan Perez"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={() => touch('name')}
                  className={inputCls('name')}
                />
              </div>
              <p className="mt-1 h-4 text-xs text-red-500">{showErr('name')}</p>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-neutral-dark dark:text-slate-300 mb-1.5">
                Correo Electronico
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">mail</span>
                <input
                  type="text"
                  placeholder="ejemplo@motormatch.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => touch('email')}
                  className={inputCls('email')}
                />
              </div>
              <p className="mt-1 h-4 text-xs text-red-500">{showErr('email')}</p>
            </div>

            {/* Contrasena + Confirmar (grid 2 columnas) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Contrasena */}
              <div>
                <label className="block text-sm font-semibold text-neutral-dark dark:text-slate-300 mb-1.5">
                  Contraseña
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">lock</span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min. 8 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => touch('password')}
                    className={inputCls('password', 'pr-12')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors"
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    <span className="material-symbols-outlined text-xl">{showPassword ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
                <p className="mt-1 h-4 text-xs text-red-500">{showErr('password')}</p>
              </div>

              {/* Confirmar contrasena */}
              <div>
                <label className="block text-sm font-semibold text-neutral-dark dark:text-slate-300 mb-1.5">
                  Confirmar Contraseña
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">lock_reset</span>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Repite tu contraseña"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onBlur={() => touch('confirmPassword')}
                    className={inputCls('confirmPassword', 'pr-12')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors"
                    aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    <span className="material-symbols-outlined text-xl">{showConfirmPassword ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
                <p className="mt-1 h-4 text-xs text-red-500">{showErr('confirmPassword')}</p>
              </div>
            </div>

            {/* Terminos */}
            <div className="flex items-start gap-2 pt-1">
              <input
                id="terms"
                type="checkbox"
                required
                className="mt-1 size-4 rounded border-slate-300 text-primary focus:ring-primary"
              />
              <label htmlFor="terms" className="text-sm text-slate-600 dark:text-slate-400 leading-tight">
                Acepto los{' '}
                <a href="#" className="text-primary font-medium hover:underline">Terminos y Condiciones</a>{' '}
                y la Politica de Privacidad de MotorMatch.
              </label>
            </div>

            {/* Errores del servidor */}
            {error && (
              <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3">
                {error}
              </p>
            )}

            {/* Boton submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-primary text-white rounded-lg font-bold text-lg hover:bg-[#081d50] transition-all shadow-lg shadow-primary/20 tracking-wider mt-1 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'CREANDO CUENTA...' : 'CREAR CUENTA'}
            </button>
          </form>

          {/* Divisor decorativo */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800" />
            </div>
          </div>

          {/* Footer */}
          <div className="mt-auto text-center">
            <p className="text-sm text-slate-500">
              Ya tienes una cuenta?{' '}
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-accent font-bold hover:underline"
              >
                Inicia sesion aqui
              </button>
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}

export default RegisterForm
