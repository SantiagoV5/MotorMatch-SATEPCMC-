const MOTORCYCLE_NOTIFICATION_EVENT = 'mm:motorcycle-notification'
const MOTORCYCLE_NOTIFICATION_SETTINGS_EVENT = 'mm:motorcycle-notification-settings'
const POPULAR_RANKING_SNAPSHOT_KEY = 'mm_motorcycle_popular_ranking_snapshot'
const MOTORCYCLE_NOTIFICATIONS_ENABLED_KEY = 'mm_motorcycle_notifications_enabled'

function getWindowObject() {
  return typeof window !== 'undefined' ? window : null
}

function readNotificationsEnabled() {
  const currentWindow = getWindowObject()
  if (!currentWindow) return true

  try {
    const storedValue = currentWindow.localStorage.getItem(MOTORCYCLE_NOTIFICATIONS_ENABLED_KEY)
    return storedValue === null ? true : storedValue === 'true'
  } catch {
    return true
  }
}

function broadcastNotificationSettings(enabled) {
  const currentWindow = getWindowObject()
  if (!currentWindow) return

  currentWindow.dispatchEvent(new CustomEvent(MOTORCYCLE_NOTIFICATION_SETTINGS_EVENT, { detail: { enabled } }))
}

function readSnapshot() {
  const currentWindow = getWindowObject()
  if (!currentWindow) return []

  try {
    const raw = currentWindow.localStorage.getItem(POPULAR_RANKING_SNAPSHOT_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveSnapshot(snapshot) {
  const currentWindow = getWindowObject()
  if (!currentWindow) return

  try {
    currentWindow.localStorage.setItem(POPULAR_RANKING_SNAPSHOT_KEY, JSON.stringify(snapshot))
  } catch {
    // Ignore storage failures.
  }
}

function createNotificationId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

function getMotorcycleLabel(motorcycle) {
  return [motorcycle?.brand, motorcycle?.model].filter(Boolean).join(' ').trim() || 'Motocicleta'
}

function showBrowserNotification(payload) {
  const currentWindow = getWindowObject()
  if (!currentWindow || !('Notification' in currentWindow) || !readNotificationsEnabled()) return

  const { Notification } = currentWindow

  if (Notification.permission === 'granted') {
    new Notification(payload.title, {
      body: payload.body,
      icon: payload.icon,
    })
    return
  }

  if (payload.requestPermission && Notification.permission === 'default') {
    void Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        new Notification(payload.title, {
          body: payload.body,
          icon: payload.icon,
        })
      }
    })
  }
}

export function getMotorcycleNotificationEventName() {
  return MOTORCYCLE_NOTIFICATION_EVENT
}

export function getMotorcycleNotificationSettingsEventName() {
  return MOTORCYCLE_NOTIFICATION_SETTINGS_EVENT
}

export function areMotorcycleNotificationsEnabled() {
  return readNotificationsEnabled()
}

export function setMotorcycleNotificationsEnabled(enabled) {
  const nextEnabled = Boolean(enabled)
  const currentWindow = getWindowObject()

  if (currentWindow) {
    try {
      currentWindow.localStorage.setItem(MOTORCYCLE_NOTIFICATIONS_ENABLED_KEY, String(nextEnabled))
    } catch {
      // Ignore storage failures.
    }
  }

  broadcastNotificationSettings(nextEnabled)
  return nextEnabled
}

export function toggleMotorcycleNotificationsEnabled() {
  return setMotorcycleNotificationsEnabled(!readNotificationsEnabled())
}

export function publishMotorcycleNotification(notification) {
  if (!readNotificationsEnabled()) {
    return null
  }

  const currentWindow = getWindowObject()
  const payload = {
    id: createNotificationId(),
    title: notification.title,
    body: notification.body,
    tone: notification.tone || 'info',
    icon: notification.icon || undefined,
    requestPermission: notification.requestPermission || false,
    duration: notification.duration || 4500,
  }

  if (currentWindow) {
    currentWindow.dispatchEvent(new CustomEvent(MOTORCYCLE_NOTIFICATION_EVENT, { detail: payload }))
  }

  showBrowserNotification(payload)
  return payload
}

export function publishMotorcycleCreatedNotification(motorcycle) {
  const label = getMotorcycleLabel(motorcycle)

  return publishMotorcycleNotification({
    title: 'Moto nueva en el catálogo',
    body: `${label} ya está disponible en MotorMatch.`,
    tone: 'success',
    icon: motorcycle?.imageUrl || undefined,
    requestPermission: true,
  })
}

export function syncPopularRankingNotifications(topMotorcycles = []) {
  if (!Array.isArray(topMotorcycles) || topMotorcycles.length === 0) {
    return false
  }

  const currentIds = topMotorcycles
    .map((motorcycle) => String(motorcycle?.id || '').trim())
    .filter(Boolean)

  if (currentIds.length === 0) {
    return false
  }

  const previousIds = readSnapshot()
  if (previousIds.length === 0) {
    saveSnapshot(currentIds)
    return false
  }

  const sameLength = previousIds.length === currentIds.length
  const sameOrder = sameLength && currentIds.every((id, index) => previousIds[index] === id)

  saveSnapshot(currentIds)

  if (sameOrder) {
    return false
  }

  const previousPositions = new Map(previousIds.map((id, index) => [id, index + 1]))
  const movedMotorcycle = topMotorcycles.find((motorcycle, index) => {
    const id = String(motorcycle?.id || '').trim()
    return id && previousIds[index] !== id
  }) || topMotorcycles[0]

  const movedId = String(movedMotorcycle?.id || '').trim()
  const previousPosition = previousPositions.get(movedId)
  const currentPosition = currentIds.indexOf(movedId) + 1
  const label = getMotorcycleLabel(movedMotorcycle)

  const body = previousPosition && currentPosition && previousPosition !== currentPosition
    ? `${label} pasó del puesto ${previousPosition} al ${currentPosition} del ranking popular.`
    : 'Se actualizaron las posiciones del ranking de motos populares.'

  publishMotorcycleNotification({
    title: 'Cambió el ranking popular',
    body,
    tone: 'info',
    icon: 'emoji_events',
    requestPermission: false,
  })

  return true
}
