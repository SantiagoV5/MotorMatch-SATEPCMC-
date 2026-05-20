import { Navigate, useLocation } from 'react-router-dom'
import useAuth from '../hooks/useAuth'

export default function AdminRoute({ children }) {
  const location = useLocation()
  const { user, token } = useAuth()

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (!user?.isAdmin) {
    return <Navigate to="/" replace state={{ accessDenied: true, message: 'Acceso denegado: necesitas permisos de administrador.' }} />
  }

  return children
}