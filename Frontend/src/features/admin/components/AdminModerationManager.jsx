import { useEffect, useMemo, useState } from 'react'
import useAuth from '../../auth/hooks/useAuth'
import { deleteReview as deleteReviewService, getAdminReviews, getAdminUsers, toggleReviewVisibility, toggleUserStatus } from '../services/adminModerationService'

const DEFAULT_REVIEW_FILTERS = { search: '', visibility: 'all', page: 1, limit: 8 }
const DEFAULT_USER_FILTERS = { search: '', status: 'all', page: 1, limit: 8 }

function formatDate(value) {
  if (!value) return 'Sin fecha'
  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function ConfirmModal({ open, title, description, confirmLabel, tone = 'danger', onCancel, onConfirm }) {
  if (!open) return null

  const toneClasses = tone === 'danger'
    ? 'bg-red-600 hover:bg-red-700 text-white'
    : 'bg-[#0A2463] hover:bg-[#0A2463]/90 text-white'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-slate-100 bg-white p-6 shadow-2xl">
        <p className="text-xs font-black uppercase tracking-[0.28em] text-[#FF6B35]">Confirmación</p>
        <h3 className="mt-2 text-2xl font-black text-[#0A2463]">{title}</h3>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">{description}</p>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-full border border-slate-200 px-4 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`flex-1 rounded-full px-4 py-3 text-sm font-black transition ${toneClasses}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminModerationManager({ onDataMutated }) {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('reviews')
  const [reviewDraftSearch, setReviewDraftSearch] = useState('')
  const [reviewFilters, setReviewFilters] = useState(DEFAULT_REVIEW_FILTERS)
  const [userDraftSearch, setUserDraftSearch] = useState('')
  const [userFilters, setUserFilters] = useState(DEFAULT_USER_FILTERS)
  const [reviewsState, setReviewsState] = useState({ items: [], pagination: null, loading: false, error: '' })
  const [usersState, setUsersState] = useState({ items: [], pagination: null, loading: false, error: '' })
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [toast, setToast] = useState('')

  const reviewQuery = useMemo(() => reviewFilters, [reviewFilters])
  const userQuery = useMemo(() => userFilters, [userFilters])

  useEffect(() => {
    let alive = true

    async function loadReviews() {
      setReviewsState((current) => ({ ...current, loading: true, error: '' }))

      try {
        const data = await getAdminReviews({
          page: reviewQuery.page,
          limit: reviewQuery.limit,
          search: reviewQuery.search,
          visibility: reviewQuery.visibility,
        })

        if (!alive) return

        setReviewsState({
          items: data.reviews || [],
          pagination: data.pagination || null,
          loading: false,
          error: '',
        })
      } catch (error) {
        if (!alive) return
        setReviewsState((current) => ({
          ...current,
          loading: false,
          error: error.response?.data?.message || 'No se pudieron cargar las reseñas.',
        }))
      }
    }

    if (activeTab === 'reviews') {
      loadReviews()
    }

    return () => { alive = false }
  }, [activeTab, reviewQuery])

  useEffect(() => {
    let alive = true

    async function loadUsers() {
      setUsersState((current) => ({ ...current, loading: true, error: '' }))

      try {
        const data = await getAdminUsers({
          page: userQuery.page,
          limit: userQuery.limit,
          search: userQuery.search,
          status: userQuery.status,
        })

        if (!alive) return

        setUsersState({
          items: data.users || [],
          pagination: data.pagination || null,
          loading: false,
          error: '',
        })
      } catch (error) {
        if (!alive) return
        setUsersState((current) => ({
          ...current,
          loading: false,
          error: error.response?.data?.message || 'No se pudieron cargar los usuarios.',
        }))
      }
    }

    if (activeTab === 'users') {
      loadUsers()
    }

    return () => { alive = false }
  }, [activeTab, userQuery])

  useEffect(() => {
    if (!toast) return undefined
    const timeout = window.setTimeout(() => setToast(''), 2500)
    return () => window.clearTimeout(timeout)
  }, [toast])

  const refreshReviews = async () => {
    const data = await getAdminReviews({
      page: reviewFilters.page,
      limit: reviewFilters.limit,
      search: reviewFilters.search,
      visibility: reviewFilters.visibility,
    })

    setReviewsState({
      items: data.reviews || [],
      pagination: data.pagination || null,
      loading: false,
      error: '',
    })
    onDataMutated?.()
  }

  const refreshUsers = async () => {
    const data = await getAdminUsers({
      page: userFilters.page,
      limit: userFilters.limit,
      search: userFilters.search,
      status: userFilters.status,
    })

    setUsersState({
      items: data.users || [],
      pagination: data.pagination || null,
      loading: false,
      error: '',
    })
    onDataMutated?.()
  }

  const handleToggleReviewVisibility = async (reviewId) => {
    try {
      await toggleReviewVisibility(reviewId)
      await refreshReviews()
      setToast('Visibilidad de la reseña actualizada.')
    } catch (error) {
      setReviewsState((current) => ({
        ...current,
        error: error.response?.data?.message || 'No se pudo cambiar la visibilidad.',
      }))
    }
  }

  const handleDeleteReview = async () => {
    if (!confirmDelete) return

    try {
      await deleteReviewService(confirmDelete.id)
      setConfirmDelete(null)
      await refreshReviews()
      setToast('Reseña eliminada correctamente.')
    } catch (error) {
      setConfirmDelete(null)
      setReviewsState((current) => ({
        ...current,
        error: error.response?.data?.message || 'No se pudo eliminar la reseña.',
      }))
    }
  }

  const handleToggleUserStatus = async (targetUser) => {
    if (!targetUser || Number(targetUser.id) === Number(user?.id)) {
      setUsersState((current) => ({
        ...current,
        error: 'No puedes deshabilitar tu propia cuenta de administrador.',
      }))
      return
    }

    try {
      await toggleUserStatus(targetUser.id)
      await refreshUsers()
      setToast(targetUser.isActive ? 'Usuario deshabilitado.' : 'Usuario reactivado.')
    } catch (error) {
      setUsersState((current) => ({
        ...current,
        error: error.response?.data?.message || 'No se pudo cambiar el estado del usuario.',
      }))
    }
  }

  const reviewRows = reviewsState.items || []
  const userRows = usersState.items || []

  return (
    <section className="mt-10 rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm md:p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#FF6B35]">Moderación</p>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-[#0A2463]">Reseñas y usuarios</h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Gestiona la visibilidad de reseñas y el estado de las cuentas sin salir del panel.
          </p>
        </div>

        <div className="inline-flex rounded-full bg-slate-100 p-1 text-sm font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('reviews')}
            className={`rounded-full px-4 py-2 transition ${activeTab === 'reviews' ? 'bg-[#0A2463] text-white' : 'text-slate-500'}`}
          >
            Reseñas
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('users')}
            className={`rounded-full px-4 py-2 transition ${activeTab === 'users' ? 'bg-[#0A2463] text-white' : 'text-slate-500'}`}
          >
            Usuarios
          </button>
        </div>
      </div>

      {toast && (
        <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
          {toast}
        </div>
      )}

      {activeTab === 'reviews' ? (
        <div className="mt-6 space-y-5">
          <div className="grid gap-3 md:grid-cols-[1.3fr_0.7fr_auto]">
            <input
              value={reviewDraftSearch}
              onChange={(event) => setReviewDraftSearch(event.target.value)}
              placeholder="Buscar por usuario, comentario o moto"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#FF6B35]"
            />
            <select
              value={reviewFilters.visibility}
              onChange={(event) => setReviewFilters((current) => ({ ...current, visibility: event.target.value, page: 1 }))}
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#FF6B35]"
            >
              <option value="all">Todas</option>
              <option value="visible">Visibles</option>
              <option value="hidden">Ocultas</option>
            </select>
            <button
              type="button"
              onClick={() => setReviewFilters((current) => ({ ...current, search: reviewDraftSearch.trim(), page: 1 }))}
              className="rounded-full bg-[#0A2463] px-5 py-3 text-sm font-black text-white transition hover:brightness-110"
            >
              Buscar
            </button>
          </div>

          {reviewsState.error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {reviewsState.error}
            </div>
          )}

          <div className="overflow-hidden rounded-3xl border border-slate-100">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-[0.18em] text-slate-400">
                  <tr>
                    <th className="px-4 py-3">Usuario</th>
                    <th className="px-4 py-3">Moto</th>
                    <th className="px-4 py-3">Comentario</th>
                    <th className="px-4 py-3">Estado</th>
                    <th className="px-4 py-3">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {reviewsState.loading ? (
                    <tr>
                      <td className="px-4 py-6 text-slate-500" colSpan={5}>Cargando reseñas...</td>
                    </tr>
                  ) : reviewRows.length === 0 ? (
                    <tr>
                      <td className="px-4 py-6 text-slate-500" colSpan={5}>No hay reseñas con los filtros actuales.</td>
                    </tr>
                  ) : reviewRows.map((review) => (
                    <tr key={review.id} className="align-top">
                      <td className="px-4 py-4">
                        <p className="font-bold text-[#0A2463]">{review.user?.fullName || 'Usuario eliminado'}</p>
                        <p className="text-xs text-slate-500">{review.user?.email || 'Sin correo'}</p>
                        <p className="mt-1 text-xs font-semibold text-slate-400">{review.user?.isActive ? 'Cuenta activa' : 'Cuenta deshabilitada'}</p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-semibold text-slate-700">
                          {review.motorcycle?.brand} {review.motorcycle?.model}
                        </p>
                        <p className="text-xs text-slate-500">{review.motorcycle?.year || 'Sin año'}</p>
                      </td>
                      <td className="px-4 py-4 text-slate-600">
                        <p className="line-clamp-3 max-w-xl whitespace-pre-line">{review.comment}</p>
                        <p className="mt-2 text-xs text-slate-400">{formatDate(review.createdAt)}</p>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.18em] ${review.isVisible ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                          {review.isVisible ? 'Visible' : 'Oculta'}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col gap-2">
                          <button
                            type="button"
                            onClick={() => handleToggleReviewVisibility(review.id)}
                            className="rounded-full border border-slate-200 px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-slate-600 transition hover:border-[#0A2463] hover:text-[#0A2463]"
                          >
                            {review.isVisible ? 'Ocultar' : 'Mostrar'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDelete(review)}
                            className="rounded-full border border-red-200 px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-red-600 transition hover:bg-red-50"
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {reviewsState.pagination && (
              <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-500">
                <span>
                  Página {reviewsState.pagination.page} de {Math.max(1, Math.ceil((reviewsState.pagination.total || 0) / reviewsState.pagination.limit))}
                </span>
                <span>{reviewsState.pagination.total || 0} reseñas</span>
              </div>
            )}

            {reviewsState.pagination && (
              <div className="flex items-center justify-between gap-3 border-t border-slate-100 bg-white px-4 py-4">
                <button
                  type="button"
                  disabled={reviewsState.pagination.page <= 1}
                  onClick={() => setReviewFilters((current) => ({ ...current, page: Math.max(1, current.page - 1) }))}
                  className="rounded-full border border-slate-200 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-slate-600 transition hover:border-[#0A2463] hover:text-[#0A2463] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Anterior
                </button>
                <button
                  type="button"
                  disabled={!reviewsState.pagination.hasMore}
                  onClick={() => setReviewFilters((current) => ({ ...current, page: current.page + 1 }))}
                  className="rounded-full border border-slate-200 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-slate-600 transition hover:border-[#0A2463] hover:text-[#0A2463] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Siguiente
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="mt-6 space-y-5">
          <div className="grid gap-3 md:grid-cols-[1.3fr_0.7fr_auto]">
            <input
              value={userDraftSearch}
              onChange={(event) => setUserDraftSearch(event.target.value)}
              placeholder="Buscar por nombre, correo o ciudad"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#FF6B35]"
            />
            <select
              value={userFilters.status}
              onChange={(event) => setUserFilters((current) => ({ ...current, status: event.target.value, page: 1 }))}
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#FF6B35]"
            >
              <option value="all">Todos</option>
              <option value="active">Activos</option>
              <option value="inactive">Deshabilitados</option>
            </select>
            <button
              type="button"
              onClick={() => setUserFilters((current) => ({ ...current, search: userDraftSearch.trim(), page: 1 }))}
              className="rounded-full bg-[#0A2463] px-5 py-3 text-sm font-black text-white transition hover:brightness-110"
            >
              Buscar
            </button>
          </div>

          {usersState.error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {usersState.error}
            </div>
          )}

          <div className="overflow-hidden rounded-3xl border border-slate-100">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-[0.18em] text-slate-400">
                  <tr>
                    <th className="px-4 py-3">Usuario</th>
                    <th className="px-4 py-3">Estado</th>
                    <th className="px-4 py-3">Reseñas</th>
                    <th className="px-4 py-3">Último acceso</th>
                    <th className="px-4 py-3">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {usersState.loading ? (
                    <tr>
                      <td className="px-4 py-6 text-slate-500" colSpan={5}>Cargando usuarios...</td>
                    </tr>
                  ) : userRows.length === 0 ? (
                    <tr>
                      <td className="px-4 py-6 text-slate-500" colSpan={5}>No hay usuarios con los filtros actuales.</td>
                    </tr>
                  ) : userRows.map((targetUser) => (
                    <tr key={targetUser.id} className="align-top">
                      <td className="px-4 py-4">
                        <p className="font-bold text-[#0A2463]">{targetUser.fullName}</p>
                        <p className="text-xs text-slate-500">{targetUser.email}</p>
                        <p className="mt-1 text-xs text-slate-400">{targetUser.city || 'Sin ciudad'}</p>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col gap-2">
                          <span className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.18em] ${targetUser.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                            {targetUser.isActive ? 'Activo' : 'Deshabilitado'}
                          </span>
                          {targetUser.isAdmin && (
                            <span className="inline-flex w-fit rounded-full bg-[#0A2463]/5 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-[#0A2463]">
                              Administrador
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-slate-600">{targetUser.reviewsCount}</td>
                      <td className="px-4 py-4 text-slate-600">{formatDate(targetUser.lastLogin || targetUser.createdAt)}</td>
                      <td className="px-4 py-4">
                        <button
                          type="button"
                          disabled={Number(targetUser.id) === Number(user?.id)}
                          onClick={() => handleToggleUserStatus(targetUser)}
                          className="rounded-full border border-slate-200 px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-slate-600 transition hover:border-[#0A2463] hover:text-[#0A2463] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {Number(targetUser.id) === Number(user?.id)
                            ? 'Tu cuenta'
                            : targetUser.isActive
                              ? 'Deshabilitar'
                              : 'Reactivar'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {usersState.pagination && (
              <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-500">
                <span>
                  Página {usersState.pagination.page} de {Math.max(1, Math.ceil((usersState.pagination.total || 0) / usersState.pagination.limit))}
                </span>
                <span>{usersState.pagination.total || 0} usuarios</span>
              </div>
            )}

            {usersState.pagination && (
              <div className="flex items-center justify-between gap-3 border-t border-slate-100 bg-white px-4 py-4">
                <button
                  type="button"
                  disabled={usersState.pagination.page <= 1}
                  onClick={() => setUserFilters((current) => ({ ...current, page: Math.max(1, current.page - 1) }))}
                  className="rounded-full border border-slate-200 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-slate-600 transition hover:border-[#0A2463] hover:text-[#0A2463] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Anterior
                </button>
                <button
                  type="button"
                  disabled={!usersState.pagination.hasMore}
                  onClick={() => setUserFilters((current) => ({ ...current, page: current.page + 1 }))}
                  className="rounded-full border border-slate-200 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-slate-600 transition hover:border-[#0A2463] hover:text-[#0A2463] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Siguiente
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <ConfirmModal
        open={Boolean(confirmDelete)}
        title="Eliminar reseña"
        description="Esta acción borra la reseña de forma permanente y no podrá recuperarse."
        confirmLabel="Eliminar"
        tone="danger"
        onCancel={() => setConfirmDelete(null)}
        onConfirm={handleDeleteReview}
      />
    </section>
  )
}