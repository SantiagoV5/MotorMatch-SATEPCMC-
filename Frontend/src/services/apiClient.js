import axios from 'axios'

const DEFAULT_PROD_API_URL = 'https://motormatch-erfb.onrender.com'

// ─────────────────────────────────────────────────────────────────────────────
// Resolución de la URL base de la API según el entorno:
//
// • LOCAL / DOCKER (desarrollo):
//     Siempre se usa '/api' para que el proxy de Vite (vite.config.js)
//     intercepte las peticiones y las reenvíe al backend correcto.
//     Esto aplica tanto si corres `npm run dev` sin Docker como si usas
//     docker-compose, ya que el proxy de Vite corre dentro del contenedor
//     y puede resolver el hostname 'backend', pero el navegador NO puede.
//
// • PRODUCCIÓN (Vercel + Render, etc.):
//     Durante el build en producción (import.meta.env.PROD === true),
//     se usa VITE_API_URL para apuntar directamente al backend desplegado
//     (ej: 'https://motormatch-erfb.onrender.com').
//     No hay proxy de Vite en producción, por lo que se necesita la URL absoluta.
//
// ─────────────────────────────────────────────────────────────────────────────

function resolveBaseURL() {
  // En producción (build estático), usar la URL absoluta del backend
  if (import.meta.env.PROD) {
    const raw = import.meta.env.VITE_API_URL || DEFAULT_PROD_API_URL
    return raw.replace(/\/api\/?$/, '') + '/api'
  }

  // En desarrollo (local o Docker), SIEMPRE usar '/api' y dejar que
  // el proxy de Vite (vite.config.js → server.proxy) maneje el reenvío.
  // Esto evita que el navegador intente resolver hostnames internos de Docker
  // como 'http://backend:3000' que solo existen dentro de la red de contenedores.
  return '/api'
}

const apiClient = axios.create({
  baseURL: resolveBaseURL(),
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
})

function clearStoredSession() {
  sessionStorage.removeItem('mm_token')
  sessionStorage.removeItem('mm_user')
  sessionStorage.removeItem('mm_remember')
  localStorage.removeItem('mm_token')
  localStorage.removeItem('mm_user')
  localStorage.removeItem('mm_remember')
  window.dispatchEvent(new CustomEvent('mm:user-updated', { detail: null }))
}

// Adjunta el JWT automáticamente en cada petición si existe
apiClient.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('mm_token') || localStorage.getItem('mm_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const message = String(error.response?.data?.message || '').toLowerCase()

    if (status === 401 || status === 403) {
      const shouldInvalidateSession =
        message.includes('deshabilitad') ||
        message.includes('sesión expirada') ||
        message.includes('no autorizado') ||
        message.includes('token inválido')

      if (shouldInvalidateSession) {
        clearStoredSession()
      }
    }

    return Promise.reject(error)
  },
)

export default apiClient
