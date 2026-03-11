import apiClient from '../../../services/apiClient'

async function login(email, password) {
  const { data } = await apiClient.post('/auth/login', { email, password })
  return data  // { token, user, message }
}

async function register(name, email, password) {
  const { data } = await apiClient.post('/auth/register', { name, email, password })
  return data  // { message, user }
}

async function verifyEmail(token) {
  const { data } = await apiClient.get(`/auth/verify-email?token=${encodeURIComponent(token)}`)
  return data  // { message, token, user }
}

export { login, register, verifyEmail }
