import { useEffect, useMemo, useState } from 'react'

const THEME_STORAGE_KEY = 'mm_theme'

function getWindowObject() {
  return typeof window !== 'undefined' ? window : null
}

function getInitialTheme() {
  const currentWindow = getWindowObject()
  if (!currentWindow) return 'light'

  try {
    const storedTheme = currentWindow.localStorage.getItem(THEME_STORAGE_KEY)
    if (storedTheme === 'dark' || storedTheme === 'light') {
      return storedTheme
    }
  } catch {
    // Ignore storage failures and fall back to the system preference.
  }

  return currentWindow.matchMedia?.('(prefers-color-scheme: dark)')?.matches ? 'dark' : 'light'
}

function applyThemeClass(theme) {
  const currentWindow = getWindowObject()
  if (!currentWindow) return

  const root = currentWindow.document.documentElement
  root.classList.toggle('dark', theme === 'dark')
  root.style.colorScheme = theme
}

export function useThemeMode() {
  const [theme, setTheme] = useState(getInitialTheme)

  useEffect(() => {
    applyThemeClass(theme)

    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme)
    } catch {
      // Ignore storage failures.
    }
  }, [theme])

  useEffect(() => {
    const currentWindow = getWindowObject()
    if (!currentWindow) return undefined

    const mediaQuery = currentWindow.matchMedia?.('(prefers-color-scheme: dark)')
    if (!mediaQuery) return undefined

    const handleChange = (event) => {
      const hasStoredTheme = currentWindow.localStorage.getItem(THEME_STORAGE_KEY)
      if (!hasStoredTheme) {
        setTheme(event.matches ? 'dark' : 'light')
      }
    }

    mediaQuery.addEventListener?.('change', handleChange)
    return () => mediaQuery.removeEventListener?.('change', handleChange)
  }, [])

  const actions = useMemo(() => ({
    setLight: () => setTheme('light'),
    setDark: () => setTheme('dark'),
    toggleTheme: () => setTheme((current) => (current === 'dark' ? 'light' : 'dark')),
  }), [])

  return {
    theme,
    isDark: theme === 'dark',
    ...actions,
  }
}

export function initializeThemeMode() {
  const currentWindow = getWindowObject()
  if (!currentWindow) return

  const root = currentWindow.document.documentElement
  const theme = getInitialTheme()
  root.classList.toggle('dark', theme === 'dark')
  root.style.colorScheme = theme
}
