import { Routes, Route, Navigate } from 'react-router-dom'
import LoginForm from './features/auth/components/loginForm'
import RegisterForm from './features/auth/components/registerForm'
import VerifyEmailPage from './features/auth/components/VerifyEmailPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import HomePage from './pages/HomePage'
import { MotorcycleDetail } from './features/motorcycles/components/motorcycleDetail'
import { QuestionnaireWizard } from './features/questionnaire'
import RecommendationList from './features/recommendations/components/recommendationList'
import FavoritesPage from './features/favorites/components/FavoritesPage'
import ComparisonPage from './pages/ComparisonPage'
import ComparisonHistoryPage from './pages/ComparisonHistoryPage'

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
      <Route path="/questionnaire" element={
        <ProtectedRoute>
          <QuestionnaireWizard />
        </ProtectedRoute>
      } />
      <Route path="/recommendations" element={
        <ProtectedRoute>
          <RecommendationList />
        </ProtectedRoute>
      } />
      <Route path="/favorites" element={
        <ProtectedRoute>
          <FavoritesPage />
        </ProtectedRoute>
      } />
      <Route path="/comparison" element={
        <ProtectedRoute>
          <ComparisonPage />
        </ProtectedRoute>
      } />
      <Route path="/comparison-history" element={
        <ProtectedRoute>
          <ComparisonHistoryPage />
        </ProtectedRoute>
      } />
      <Route path="/login"    element={<LoginForm />} />
      <Route path="/register"     element={<RegisterForm />} />
      <Route path="/verify-email"   element={<VerifyEmailPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="*"              element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App