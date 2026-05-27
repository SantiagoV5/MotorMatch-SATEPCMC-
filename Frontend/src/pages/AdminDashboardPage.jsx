import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import apiClient from '../services/apiClient'
import Header from '../shared/components/layout/header'
import useAuth from '../features/auth/hooks/useAuth'
import AdminMotorcycleManager from '../features/admin/components/AdminMotorcycleManager'
import AdminModerationManager from '../features/admin/components/AdminModerationManager'

function AdminDashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [stats, setStats] = useState(null)

  const loadStats = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const { data } = await apiClient.get('/admin/stats')
      setStats(data.data)
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo cargar el panel de administrador')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadStats()
  }, [loadStats])

  const formatNumber = (value) => new Intl.NumberFormat('es-CO').format(Number(value || 0))

  const summaryCards = [
    {
      label: 'Usuarios activos',
      value: formatNumber(stats?.totals?.activeUsers),
      helper: `${formatNumber(stats?.totals?.disabledUsers)} deshabilitados`,
    },
    {
      label: 'Reseñas visibles',
      value: formatNumber(stats?.totals?.visibleReviews),
      helper: `${formatNumber(stats?.totals?.hiddenReviews)} ocultas`,
    },
    {
      label: 'Motos activas',
      value: formatNumber(stats?.totals?.activeMotorcycles),
      helper: `${formatNumber(stats?.totals?.motorcycles)} registradas`,
    },
    {
      label: 'Total de usuarios',
      value: formatNumber(stats?.totals?.users),
      helper: 'Incluye administradores',
    },
    {
      label: 'Total de reseñas',
      value: formatNumber(stats?.totals?.reviews),
      helper: `Promedio ${Number(stats?.totals?.averageRating || 0).toFixed(1)}/5`,
    },
    {
      label: 'Sección',
      value: stats?.section || 'Dashboard',
      helper: stats?.message || 'Panel preparado para moderación',
    },
  ]

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-slate-800">
      <Header sticky={false} />

      <main className="mx-auto max-w-6xl px-4 py-10 md:px-6">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-[#FF6B35]">Panel de administración</p>
            <h1 className="text-4xl font-black tracking-tight text-[#0A2463]">Dashboard de administrador</h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-500">
              Espacio exclusivo para gestionar la plataforma y validar el acceso administrativo.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/')}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 shadow-sm transition hover:border-primary/20 hover:text-primary"
          >
            Volver al inicio
          </button>
        </div>

        <section className="mb-8 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Sesión confirmada para</p>
          <p className="mt-1 text-lg font-bold text-primary">{user?.name || user?.fullName || 'Administrador'}</p>
        </section>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {summaryCards.map((card) => (
            <article key={card.label} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">{card.label}</p>
              <h2 className="mt-2 text-2xl font-black text-[#0A2463]">{loading ? 'Cargando…' : card.value}</h2>
              <p className="mt-2 text-sm text-slate-500">{card.helper}</p>
            </article>
          ))}
        </section>

        <AdminMotorcycleManager onDataMutated={loadStats} />
        <AdminModerationManager onDataMutated={loadStats} />
      </main>
    </div>
  )
}

export default AdminDashboardPage