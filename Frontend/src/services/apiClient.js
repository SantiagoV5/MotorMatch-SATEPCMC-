import axios from 'axios'

const apiClient = axios.create({
  baseURL: '/api',       // Vite proxy → http://localhost:3000/api
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
})

// Adjunta el JWT automáticamente en cada petición si existe
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('mm_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default apiClient
