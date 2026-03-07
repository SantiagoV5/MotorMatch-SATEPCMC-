import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthSidePanel from './AuthSidePanel'
import useAuth from '../hooks/useAuth'

function RegisterForm() {
  const [showPassword, setShowPassword]               = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [name, setName]                   = useState('')
  const [email, setEmail]                 = useState('')
  const [password, setPassword]           = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [formError, setFormError]         = useState(null)
  const navigate                          = useNavigate()
  const { register, loading, error }      = useAuth()

  async function handleSubmit(e) {
    e.preventDefault()
    if (password !== confirmPassword) {
      setFormError('Las contraseñas no coinciden')
      return
    }
    setFormError(null)
    try {
      await register(name, email, password)
      navigate('/')  // redirigir tras registro exitoso
    } catch {
      // el error queda capturado en useAuth().error
    }
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
          <form className="space-y-4" onSubmit={handleSubmit}>

            {/* Nombre */}
            <div>
              <label className="block text-sm font-semibold text-neutral-dark dark:text-slate-300 mb-1.5">
                Nombre Completo
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  person
                </span>
                <input
                  type="text"
                  placeholder="Juan Perez"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all dark:text-white"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-neutral-dark dark:text-slate-300 mb-1.5">
                Correo Electronico
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  mail
                </span>
                <input
                  type="email"
                  placeholder="ejemplo@motormatch.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all dark:text-white"
                />
              </div>
            </div>

            {/* Contrasena + Confirmar (grid 2 columnas) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Contrasena */}
              <div>
                <label className="block text-sm font-semibold text-neutral-dark dark:text-slate-300 mb-1.5">
                  Contrasena
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    lock
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="xxxxxxxxxx"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors"
                    aria-label={showPassword ? 'Ocultar contrasena' : 'Mostrar contrasena'}
                  >
                    <span className="material-symbols-outlined text-xl">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Confirmar contrasena */}
              <div>
                <label className="block text-sm font-semibold text-neutral-dark dark:text-slate-300 mb-1.5">
                  Confirmar Contrasena
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    lock_reset
                  </span>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="xxxxxxxxxx"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors"
                    aria-label={showConfirmPassword ? 'Ocultar contrasena' : 'Mostrar contrasena'}
                  >
                    <span className="material-symbols-outlined text-xl">
                      {showConfirmPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Terminos */}
            <div className="flex items-start gap-2 pt-2">
              <input
                id="terms"
                type="checkbox"
                required
                className="mt-1 size-4 rounded border-slate-300 text-primary focus:ring-primary"
              />
              <label htmlFor="terms" className="text-sm text-slate-600 dark:text-slate-400 leading-tight">
                Acepto los{' '}
                <a href="#" className="text-primary font-medium hover:underline">
                  Terminos y Condiciones
                </a>{' '}
                y la Politica de Privacidad de MotorMatch.
              </label>
            </div>

            {/* Errores */}
            {(formError || error) && (
              <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3">
                {formError || error}
              </p>
            )}

            {/* Boton submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-primary text-white rounded-lg font-bold text-lg hover:bg-[#081d50] transition-all shadow-lg shadow-primary/20 tracking-wider mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'CREANDO CUENTA...' : 'CREAR CUENTA'}
            </button>
          </form>

          {/* Divisor */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white dark:bg-slate-900 px-4 text-slate-500 uppercase tracking-widest text-xs">
                
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-auto pt-8 text-center">
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
