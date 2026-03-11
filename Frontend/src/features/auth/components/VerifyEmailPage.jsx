import { useEffect, useState, useRef } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { verifyEmail } from '../services/authService'

const STATUS = { LOADING: 'loading', SUCCESS: 'success', ERROR: 'error' }

export default function VerifyEmailPage() {
  const [searchParams]  = useSearchParams()
  const navigate        = useNavigate()
  const [status, setStatus]   = useState(STATUS.LOADING)
  const [message, setMessage] = useState('')
  const hasRun = useRef(false)   // evita doble ejecución en React StrictMode

  useEffect(() => {
    if (hasRun.current) return
    hasRun.current = true

    const token = searchParams.get('token')
    if (!token) {
      setStatus(STATUS.ERROR)
      setMessage('Enlace de verificación inválido o incompleto.')
      return
    }

    verifyEmail(token)
      .then(data => {
        sessionStorage.setItem('mm_token', data.token)
        sessionStorage.setItem('mm_user', JSON.stringify(data.user))
        // Redirigir inmediatamente sin mostrar pantalla intermedia
        navigate('/', { replace: true })
      })
      .catch(err => {
        let msg
        if (!err.response) {
          msg = 'No se pudo conectar al servidor. Asegúrate de que el backend esté corriendo e intenta de nuevo.'
        } else {
          msg = err.response?.data?.message || 'El enlace es inválido o ha expirado.'
        }
        setStatus(STATUS.ERROR)
        setMessage(msg)
      })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-xl shadow-2xl p-10 text-center">

        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
        </div>

        {status === STATUS.LOADING && (
          <>
            <div className="flex justify-center mb-4">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
            <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-200">
              Verificando tu correo…
            </h2>
            <p className="mt-2 text-slate-500 dark:text-slate-400 text-sm">Un momento, por favor.</p>
          </>
        )}

        {status === STATUS.SUCCESS && (
          <>
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">¡Correo verificado!</h2>
            <p className="mt-3 text-slate-500 dark:text-slate-400 text-sm">
              Tu cuenta está activa. Te redirigimos al inicio en unos segundos…
            </p>
            <Link
              to="/"
              className="mt-6 inline-block w-full py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors"
            >
              Ir al inicio ahora
            </Link>
          </>
        )}

        {status === STATUS.ERROR && (
          <>
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Enlace inválido</h2>
            <p className="mt-3 text-slate-500 dark:text-slate-400 text-sm">{message}</p>
            <Link
              to="/register"
              className="mt-6 inline-block w-full py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors"
            >
              Registrarme de nuevo
            </Link>
          </>
        )}

      </div>
    </div>
  )
}
