import { Navigate } from 'react-router-dom'
import { resolvePostLoginPath } from '../utils/authRedirect'

export default function PublicOnlyRoute({ children }) {
  const token = sessionStorage.getItem('mm_token') || localStorage.getItem('mm_token')

  if (token) {
    return <Navigate to={resolvePostLoginPath(null, '/')} replace />
  }

  return children
}
