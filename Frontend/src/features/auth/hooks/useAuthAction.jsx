import { useCallback, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import AuthRequiredModal from '../components/AuthRequiredModal'
import useAuth from './useAuth'
import { buildReturnPath, rememberAuthIntent } from '../utils/authRedirect'

export default function useAuthAction() {
  const location = useLocation()
  const { token } = useAuth()
  const [promptConfig, setPromptConfig] = useState(null)
  const isAuthenticated = Boolean(token)

  const requireAuth = useCallback(
    ({
      action = null,
      returnTo,
      title,
      description,
    } = {}) => {
      if (isAuthenticated) return true

      rememberAuthIntent({
        returnTo: returnTo || buildReturnPath(location),
        action,
      })

      setPromptConfig({
        title,
        description,
      })

      return false
    },
    [isAuthenticated, location],
  )

  const authModal = useMemo(
    () => (
      <AuthRequiredModal
        isOpen={Boolean(promptConfig)}
        onClose={() => setPromptConfig(null)}
        title={promptConfig?.title}
        description={promptConfig?.description}
      />
    ),
    [promptConfig],
  )

  return {
    isAuthenticated,
    requireAuth,
    authModal,
    closeAuthPrompt: () => setPromptConfig(null),
  }
}
