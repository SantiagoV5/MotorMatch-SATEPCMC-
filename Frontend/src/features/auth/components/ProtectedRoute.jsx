import { Navigate, useLocation } from 'react-router-dom'
import { buildReturnPath, rememberAuthIntent } from '../utils/authRedirect'

export default function ProtectedRoute({ children }) {
  const location = useLocation()
  const token = sessionStorage.getItem('mm_token') || localStorage.getItem('mm_token')

  if (!token) {
    const returnTo = buildReturnPath(location)
    rememberAuthIntent({ returnTo })
    return <Navigate to="/login" replace state={{ from: returnTo }} />
  }

  return children
}
