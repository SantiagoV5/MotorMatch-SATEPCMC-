import axios from 'axios'

// ─────────────────────────────────────────────────────────────────────────────
// Resolución de la URL base de la API según el entorno:
//
// • LOCAL (docker-compose / npm run dev):
//     VITE_API_URL no está definida en el proceso de build local,
//     así que baseURL queda como '/api' y el proxy de Vite
//     (vite.config.js → proxy['/api']) lo redirige a http://backend:3000.
//
// • PRODUCCIÓN (Vercel + Render):
//     Durante el build en Vercel, VITE_API_URL = 'https://motormatch-erfb.onrender.com'
//     queda horneada en el bundle, así que axios apunta directamente
//     a https://motormatch-erfb.onrender.com/api sin pasar por ningún proxy.
//
// La regla: si VITE_API_URL termina en '/api', lo normalizamos para no
// generar rutas duplicadas como /api/api/auth/login.
// ─────────────────────────────────────────────────────────────────────────────

function resolveBaseURL() {
  const raw = import.meta.env.VITE_API_URL   // undefined en local, URL real en producción
  if (!raw) return '/api'                     // local → proxy de Vite se encarga
  return raw.replace(/\/api\/?$/, '') + '/api' // producción → URL absoluta + /api
}

const apiClient = axios.create({
  baseURL: resolveBaseURL(),
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
})

// Adjunta el JWT automáticamente en cada petición si existe
apiClient.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('mm_token') || localStorage.getItem('mm_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default apiClient
