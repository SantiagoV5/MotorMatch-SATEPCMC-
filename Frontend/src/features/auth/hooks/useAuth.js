import { useState, useCallback } from 'react'
import { login as loginService, register as registerService } from '../services/authService'

const TOKEN_KEY = 'mm_token'
const USER_KEY  = 'mm_user'

function useAuth() {
  const [user, setUser]       = useState(() => JSON.parse(sessionStorage.getItem(USER_KEY) || 'null'))
  const [token, setToken]     = useState(() => sessionStorage.getItem(TOKEN_KEY) || null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  function persist(newToken, newUser) {
    sessionStorage.setItem(TOKEN_KEY, newToken)
    sessionStorage.setItem(USER_KEY, JSON.stringify(newUser))
    setToken(newToken)
    setUser(newUser)
  }

  const login = useCallback(async (email, password) => {
    setLoading(true)
    setError(null)
    try {
      const data = await loginService(email, password)
      persist(data.token, data.user)
      return data
    } catch (err) {
      const message = err.response?.data?.message || 'Error al iniciar sesión'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const register = useCallback(async (name, email, password) => {
    setLoading(true)
    setError(null)
    try {
      const data = await registerService(name, email, password)
      // No llamamos persist() aquí: el usuario aún no tiene JWT.
      // Recibirá el token solo después de verificar su email.
      return data
    } catch (err) {
      const message = err.response?.data?.message || 'Error al registrarse'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    sessionStorage.removeItem(TOKEN_KEY)
    sessionStorage.removeItem(USER_KEY)
    setToken(null)
    setUser(null)
  }, [])

  return { user, token, loading, error, login, register, logout }
}

export default useAuth
