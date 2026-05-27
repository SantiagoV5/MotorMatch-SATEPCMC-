import { useEffect, useState, useCallback } from 'react'
import { login as loginService, register as registerService } from '../services/authService'

const TOKEN_KEY = 'mm_token'
const USER_KEY  = 'mm_user'
const REMEMBER_KEY = 'mm_remember'

function decodeTokenPayload(token) {
  if (!token || typeof token !== 'string') return null

  try {
    const payloadPart = token.split('.')[1]
    if (!payloadPart) return null

    const normalized = payloadPart.replace(/-/g, '+').replace(/_/g, '/')
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')
    return JSON.parse(atob(padded))
  } catch {
    return null
  }
}

function normalizeUser(user, token = null) {
  if (!user) return null

  const tokenPayload = decodeTokenPayload(token)

  return {
    ...user,
    name: user.name || user.fullName || '',
    fullName: user.fullName || user.name || '',
    isAdmin: Boolean(user.isAdmin ?? user.is_admin ?? tokenPayload?.is_admin ?? tokenPayload?.isAdmin ?? false),
  }
}

function readStoredUser() {
  const rawUser = sessionStorage.getItem(USER_KEY) || localStorage.getItem(USER_KEY)
  const rawToken = sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY) || null
  if (!rawUser) return null

  try {
    return normalizeUser(JSON.parse(rawUser), rawToken)
  } catch {
    return null
  }
}

function useAuth() {
  const [user, setUser]       = useState(() => readStoredUser())
  const [token, setToken]     = useState(() => sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY) || null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  useEffect(() => {
    const handleUserUpdate = (event) => {
      setUser(normalizeUser(event.detail, token))
    }

    window.addEventListener('mm:user-updated', handleUserUpdate)
    return () => window.removeEventListener('mm:user-updated', handleUserUpdate)
  }, [])

  function resolveStorage() {
    const remember = localStorage.getItem(REMEMBER_KEY)
    if (remember === 'true') return localStorage
    if (remember === 'false') return sessionStorage
    return sessionStorage.getItem(TOKEN_KEY) ? sessionStorage : localStorage
  }

  function persist(newToken, newUser, rememberMe = false) {
    const normalizedUser = normalizeUser(newUser, newToken)
    const storage = rememberMe ? localStorage : sessionStorage
    const otherStorage = rememberMe ? sessionStorage : localStorage
    
    // Guardar en el storage correcto
    storage.setItem(TOKEN_KEY, newToken)
    storage.setItem(USER_KEY, JSON.stringify(normalizedUser))
    storage.setItem(REMEMBER_KEY, rememberMe.toString())
    
    // Limpiar el otro storage
    otherStorage.removeItem(TOKEN_KEY)
    otherStorage.removeItem(USER_KEY)
    otherStorage.removeItem(REMEMBER_KEY)
    
    setToken(newToken)
    setUser(normalizedUser)
    window.dispatchEvent(new CustomEvent('mm:user-updated', { detail: normalizedUser }))
  }

  function updateUser(nextUser) {
    const normalizedUser = normalizeUser(nextUser, token)
    const storage = resolveStorage()
    storage.setItem(USER_KEY, JSON.stringify(normalizedUser))
    setUser(normalizedUser)
    window.dispatchEvent(new CustomEvent('mm:user-updated', { detail: normalizedUser }))
  }

  const login = useCallback(async (email, password, rememberMe = false) => {
    setLoading(true)
    setError(null)
    try {
      const data = await loginService(email, password)
      persist(data.token, data.user, rememberMe)
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
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    localStorage.removeItem(REMEMBER_KEY)
    setToken(null)
    setUser(null)
    window.dispatchEvent(new CustomEvent('mm:user-updated', { detail: null }))
  }, [])

  return { user, token, isAuthenticated: Boolean(token), loading, error, login, register, logout, updateUser }
}

export default useAuth
