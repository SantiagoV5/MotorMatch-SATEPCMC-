import { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

const LoginForm = lazy(() => import('./features/auth/components/loginForm'))
const RegisterForm = lazy(() => import('./features/auth/components/registerForm'))
const VerifyEmailPage = lazy(() => import('./features/auth/components/VerifyEmailPage'))
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'))
const HomePage = lazy(() => import('./pages/HomePage'))
const MotorcycleDetail = lazy(() =>
  import('./features/motorcycles/components/motorcycleDetail').then((module) => ({
    default: module.MotorcycleDetail,
  })),
)
const QuestionnaireWizard = lazy(() =>
  import('./features/questionnaire').then((module) => ({
    default: module.QuestionnaireWizard,
  })),
)
const RecommendationList = lazy(() => import('./features/recommendations/components/recommendationList'))
const FavoritesPage = lazy(() => import('./features/favorites/components/FavoritesPage'))
const ComparisonPage = lazy(() => import('./pages/ComparisonPage'))
const ComparisonHistoryPage = lazy(() => import('./pages/ComparisonHistoryPage'))
const SimulationsHistoryPage = lazy(() =>
  import('./pages/SimulationsHistoryPage').then((module) => ({
    default: module.SimulationsHistoryPage,
  })),
)
const FinancialTipsPage = lazy(() => import('./pages/FinancialTipsPage'))
const MarketAnalysisPage = lazy(() => import('./pages/MarketAnalysisPage'))
const MarketTrendsPage = lazy(() => import('./pages/MarketTrendsPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const HelpFaqPage = lazy(() => import('./pages/HelpFaqPage'))
const SupportPage = lazy(() => import('./pages/SupportPage'))
const AIChatPage  = lazy(() => import('./pages/AIChatPage'))

function RouteFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background-light">
      <div className="h-14 w-14 animate-spin rounded-full border-4 border-slate-200 border-t-accent" />
    </div>
  )
}

// Protected Route Wrapper
function ProtectedRoute({ children }) {
  const token = sessionStorage.getItem('mm_token') || localStorage.getItem('mm_token')
  if (!token) return <Navigate to="/login" replace />
  return children
}

function App() {
  return (
    <Suspense fallback={<RouteFallback />}>
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
        <Route path="/simulations-history" element={
          <ProtectedRoute>
            <SimulationsHistoryPage />
          </ProtectedRoute>
        } />
        <Route path="/financial-tips" element={
          <ProtectedRoute>
            <FinancialTipsPage />
          </ProtectedRoute>
        } />
        <Route path="/market-analysis" element={
          <ProtectedRoute>
            <MarketAnalysisPage />
          </ProtectedRoute>
        } />
        <Route path="/market-trends" element={
          <ProtectedRoute>
            <MarketTrendsPage />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } />
        <Route path="/ayuda-faq" element={<HelpFaqPage />} />
        <Route path="/soporte" element={<SupportPage />} />
        <Route path="/ai-chat" element={
          <ProtectedRoute>
            <AIChatPage />
          </ProtectedRoute>
        } />
        <Route path="/login"    element={<LoginForm />} />
        <Route path="/register"     element={<RegisterForm />} />
        <Route path="/verify-email"   element={<VerifyEmailPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="*"              element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  )
}

export default App
