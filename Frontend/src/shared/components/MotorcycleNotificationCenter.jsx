import { useEffect, useMemo, useRef, useState } from 'react'
import { useThemeMode } from '../hooks/useThemeMode'
import { getMotorcycleCatalogEventName } from '../utils/motorcycleCatalogEvents'
import {
  areMotorcycleNotificationsEnabled,
  getMotorcycleNotificationSettingsEventName,
  getMotorcycleNotificationEventName,
  publishMotorcycleCreatedNotification,
  setMotorcycleNotificationsEnabled,
} from '../services/motorcycleNotifications'

const TONE_CLASSES = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  info: 'border-slate-200 bg-white text-slate-800',
  warning: 'border-amber-200 bg-amber-50 text-amber-900',
  error: 'border-rose-200 bg-rose-50 text-rose-900',
}

function NotificationToast({ item, onDismiss }) {
  const toneClass = TONE_CLASSES[item.tone] || TONE_CLASSES.info

  return (
    <article className={`pointer-events-auto rounded-2xl border px-4 py-3 shadow-xl backdrop-blur-sm ${toneClass}`}>
      <div className="flex items-start gap-3">
        <span className="material-symbols-outlined mt-0.5 text-lg text-current">
          {item.icon || 'notifications'}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-black leading-tight">{item.title}</p>
          <p className="mt-1 text-xs leading-relaxed opacity-80">{item.body}</p>
        </div>
        <button
          type="button"
          onClick={() => onDismiss(item.id)}
          className="ml-1 rounded-full p-1 text-current/60 transition hover:bg-black/5 hover:text-current"
          aria-label="Cerrar notificación"
        >
          <span className="material-symbols-outlined text-base">close</span>
        </button>
      </div>
    </article>
  )
}

export default function MotorcycleNotificationCenter() {
  const [notifications, setNotifications] = useState([])
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => areMotorcycleNotificationsEnabled())
  const timeoutIdsRef = useRef([])
  const { isDark, toggleTheme } = useThemeMode()

  const activeEventName = useMemo(() => getMotorcycleNotificationEventName(), [])
  const catalogEventName = useMemo(() => getMotorcycleCatalogEventName(), [])
  const settingsEventName = useMemo(() => getMotorcycleNotificationSettingsEventName(), [])

  useEffect(() => {
    const handleNotification = (event) => {
      const notification = event.detail
      if (!notification?.title) return

      const nextNotification = {
        ...notification,
        id: notification.id || `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
      }

      setNotifications((current) => [nextNotification, ...current].slice(0, 3))

      const timeoutId = window.setTimeout(() => {
        setNotifications((current) => current.filter((item) => item.id !== nextNotification.id))
      }, nextNotification.duration || 4500)

      timeoutIdsRef.current.push(timeoutId)
    }

    window.addEventListener(activeEventName, handleNotification)
    return () => {
      window.removeEventListener(activeEventName, handleNotification)
      timeoutIdsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId))
      timeoutIdsRef.current = []
    }
  }, [activeEventName])

  useEffect(() => {
    const handleCatalogUpdate = (event) => {
      if (event.detail?.action !== 'created' || !event.detail?.motorcycle) return
      publishMotorcycleCreatedNotification(event.detail.motorcycle)
    }

    window.addEventListener(catalogEventName, handleCatalogUpdate)
    return () => window.removeEventListener(catalogEventName, handleCatalogUpdate)
  }, [catalogEventName])

  useEffect(() => {
    const handleSettingsUpdate = (event) => {
      setNotificationsEnabled(Boolean(event.detail?.enabled))
    }

    const handleStorage = (event) => {
      if (event.key === 'mm_motorcycle_notifications_enabled') {
        setNotificationsEnabled(event.newValue !== 'false')
      }
    }

    window.addEventListener(settingsEventName, handleSettingsUpdate)
    window.addEventListener('storage', handleStorage)

    return () => {
      window.removeEventListener(settingsEventName, handleSettingsUpdate)
      window.removeEventListener('storage', handleStorage)
    }
  }, [settingsEventName])

  const handleToggleNotifications = () => {
    const nextEnabled = setMotorcycleNotificationsEnabled(!notificationsEnabled)
    setNotificationsEnabled(nextEnabled)
  }

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[80] flex w-[min(22rem,calc(100vw-1rem))] flex-col items-end gap-3">
      <button
        type="button"
        onClick={toggleTheme}
        aria-pressed={isDark}
        aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
        className={`pointer-events-auto inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.14em] shadow-lg backdrop-blur-sm transition-all ${
          isDark
            ? 'border-slate-700 bg-slate-950 text-slate-100 hover:border-slate-500'
            : 'border-[#0A2463]/15 bg-white text-[#0A2463] hover:border-[#FF6B35]/40'
        }`}
      >
        <span className="material-symbols-outlined text-base">
          {isDark ? 'light_mode' : 'dark_mode'}
        </span>
        {isDark ? 'Modo claro' : 'Modo oscuro'}
      </button>

      <button
        type="button"
        onClick={handleToggleNotifications}
        aria-pressed={notificationsEnabled}
        className={`pointer-events-auto inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.14em] shadow-lg backdrop-blur-sm transition-all ${
          notificationsEnabled
            ? 'border-[#FF6B35]/30 bg-white text-[#0A2463] hover:border-[#FF6B35]/50'
            : 'border-slate-200 bg-slate-900 text-white hover:bg-slate-800'
        }`}
      >
        <span className="material-symbols-outlined text-base">
          {notificationsEnabled ? 'notifications_active' : 'notifications_off'}
        </span>
        {notificationsEnabled ? 'Notificaciones activas' : 'Notificaciones apagadas'}
      </button>

      {notifications.length > 0 && (
        <div className="flex w-full flex-col gap-3">
          {notifications.map((notification) => (
            <NotificationToast
              key={notification.id}
              item={notification}
              onDismiss={(id) => setNotifications((current) => current.filter((item) => item.id !== id))}
            />
          ))}
        </div>
      )}
    </div>
  )
}
