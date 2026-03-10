<<<<<<< Updated upstream
=======
﻿import { Routes, Route, Navigate } from 'react-router-dom'
import LoginForm from './features/auth/components/loginForm'
import RegisterForm from './features/auth/components/registerForm'
import VerifyEmailPage from './features/auth/components/VerifyEmailPage'
import HomePage from './pages/HomePage'
import { MotorcycleDetail } from './features/motorcycles/components/motorcycleDetail'

// Protected Route Wrapper
function ProtectedRoute({ children }) {
  const token = sessionStorage.getItem('mm_token')
  if (!token) return <Navigate to="/login" replace />
  return children
}

function App() {
  return (
    <Routes>
      <Route path="/" element={
        <ProtectedRoute>
          <HomePage />
        </ProtectedRoute>
      } />
      <Route path="/home" element={
        <ProtectedRoute>
          <HomePage />
        </ProtectedRoute>
      } />
      <Route path="/motorcycles/:id" element={
        <ProtectedRoute>
          <MotorcycleDetail />
        </ProtectedRoute>
      } />
      <Route path="/login"    element={<LoginForm />} />
      <Route path="/register"     element={<RegisterForm />} />
      <Route path="/verify-email"  element={<VerifyEmailPage />} />
      <Route path="*"              element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App
>>>>>>> Stashed changes
