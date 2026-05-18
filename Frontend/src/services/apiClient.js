import axios from 'axios'

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
    const raw = import.meta.env.VITE_API_URL
    if (raw) return raw.replace(/\/api\/?$/, '') + '/api'
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

// Adjunta el JWT automáticamente en cada petición si existe
apiClient.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('mm_token') || localStorage.getItem('mm_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default apiClient
