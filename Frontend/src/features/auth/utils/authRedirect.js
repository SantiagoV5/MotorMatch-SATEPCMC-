const AUTH_INTENT_KEY = 'mm_auth_intent'

export function buildReturnPath(locationLike) {
  if (!locationLike) return '/'
  const pathname = locationLike.pathname || '/'
  const search = locationLike.search || ''
  const hash = locationLike.hash || ''
  return `${pathname}${search}${hash}` || '/'
}

export function rememberAuthIntent({ returnTo = '/', action = null } = {}) {
  if (typeof sessionStorage === 'undefined') return

  try {
    sessionStorage.setItem(
      AUTH_INTENT_KEY,
      JSON.stringify({
        returnTo,
        action,
        savedAt: Date.now(),
      }),
    )
  } catch {
    // Ignore storage failures and let the login fallback use route state.
  }
}

export function readAuthIntent() {
  if (typeof sessionStorage === 'undefined') return null

  try {
    const raw = sessionStorage.getItem(AUTH_INTENT_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function clearAuthIntent() {
  if (typeof sessionStorage === 'undefined') return
  sessionStorage.removeItem(AUTH_INTENT_KEY)
}

export function consumeAuthIntent() {
  const intent = readAuthIntent()
  clearAuthIntent()
  return intent
}

export function resolvePostLoginPath(locationState, fallback = '/') {
  const intent = readAuthIntent()
  if (intent?.returnTo) return intent.returnTo
  if (typeof locationState?.from === 'string') return locationState.from
  return fallback
}

export function consumeMatchingAuthAction(matcher) {
  const intent = readAuthIntent()
  if (!intent?.action || typeof matcher !== 'function') return null

  if (!matcher(intent.action)) return null

  clearAuthIntent()
  return intent.action
}
