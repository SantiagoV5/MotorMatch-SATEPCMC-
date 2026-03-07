import { Routes, Route, Navigate } from 'react-router-dom'
import LoginForm from './features/auth/components/loginForm'
import RegisterForm from './features/auth/components/registerForm'

// Placeholder temporal — se reemplazará por el dashboard real
function Home() {
  const user = JSON.parse(localStorage.getItem('mm_user') || 'null')
  if (!user) return <Navigate to="/login" replace />
  return (
    <div className="min-h-screen flex items-center justify-center bg-background-light">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-primary mb-2">¡Bienvenido, {user.name}!</h1>
        <p className="text-slate-500">Dashboard en construcción...</p>
      </div>
    </div>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/"         element={<Home />} />
      <Route path="/login"    element={<LoginForm />} />
      <Route path="/register" element={<RegisterForm />} />
      <Route path="*"         element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App
