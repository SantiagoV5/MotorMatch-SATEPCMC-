import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../shared/components/layout/header'
import useAuth from '../features/auth/hooks/useAuth'
import { getAvailableBrands, getMyProfile, updateMyProfile } from '../features/profile/services/profileService'
import PriceAlertList from '../features/priceAlerts/components/PriceAlertList'

function normalizePhone(value) {
  return value.replace(/[^0-9+\-\s()]/g, '')
}

export default function ProfilePage() {
  const navigate = useNavigate()
  const { user, logout, updateUser } = useAuth()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('DATA') // 'DATA' | 'ALERTS'
  const [availableBrands, setAvailableBrands] = useState([])
  const [form, setForm] = useState({
    fullName: user?.name || user?.fullName || '',
    phone: '',
    heightCm: '',
    city: '',
    preferredBrands: [],
  })

  const validation = useMemo(() => {
    const next = {}
    if (!form.fullName.trim() || form.fullName.trim().length < 2) next.fullName = 'Ingresa tu nombre completo'
    const phoneValue = form.phone.trim()
    if (phoneValue && !/^[0-9+\-\s()]{7,20}$/.test(phoneValue)) next.phone = 'Teléfono inválido'
    const heightValue = Number(form.heightCm)
    if (!Number.isInteger(heightValue) || heightValue < 140 || heightValue > 220) next.heightCm = 'La estatura debe estar entre 140 y 220 cm'
    if (!form.city.trim() || form.city.trim().length < 2) next.city = 'Ingresa tu ciudad de residencia'
    if (!form.preferredBrands.length) next.preferredBrands = 'Selecciona al menos una marca preferida'
    return next
  }, [form])

  const canSave = Object.keys(validation).length === 0 && !saving

  useEffect(() => {
    let mounted = true

    async function load() {
      try {
        setLoading(true)
        setError('')
        const [profile, brands] = await Promise.all([
          getMyProfile(),
          getAvailableBrands(),
        ])

        if (!mounted) return

        setForm({
          fullName: profile.fullName || profile.name || user?.name || '',
          phone: profile.phone || '',
          heightCm: profile.heightCm || '',
          city: profile.city || '',
          preferredBrands: profile.preferredBrands || [],
        })
        setAvailableBrands(brands)
      } catch (err) {
        if (!mounted) return
        setError(err.response?.data?.message || 'No se pudo cargar el perfil')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()
    return () => { mounted = false }
  }, [])

  function handleChange(field, value) {
    setSuccess('')
    setError('')
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function toggleBrand(brand) {
    setSuccess('')
    setError('')
    setForm(prev => {
      const next = prev.preferredBrands.includes(brand)
        ? prev.preferredBrands.filter(item => item !== brand)
        : [...prev.preferredBrands, brand]
      return { ...prev, preferredBrands: next }
    })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!canSave) {
      setError('Revisa los campos del formulario')
      return
    }

    try {
      setSaving(true)
      const updated = await updateMyProfile({
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        heightCm: Number(form.heightCm),
        city: form.city.trim(),
        preferredBrands: form.preferredBrands,
      })

      updateUser(updated)
      setSuccess('Perfil actualizado correctamente.')
    } catch (err) {
      const details = err.response?.data?.details
      if (Array.isArray(details) && details.length) {
        setError(details.join('; '))
      } else {
        setError(err.response?.data?.message || 'No se pudo actualizar el perfil')
      }
    } finally {
      setSaving(false)
    }
  }

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-slate-800">
      <Header sticky={false} />

      <main className="mx-auto max-w-5xl px-4 md:px-6 py-10">
        <div className="mb-8 text-center md:text-left">
          <p className="text-xs font-bold uppercase tracking-widest text-[#FF6B35] mb-2">Mi Cuenta</p>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-[#0A2463]">Panel de usuario</h1>
          <p className="mt-3 text-sm text-slate-500 max-w-2xl mx-auto md:mx-0">
            Configura tus datos, preferencias y gestiona tus alertas activas.
          </p>
        </div>

        {/* --- Menú de Pestañas --- */}
        <div className="flex border-b border-slate-200 mb-8 overflow-x-auto hide-scrollbar">
          <button
            onClick={() => setActiveTab('DATA')}
            className={`px-6 py-4 font-bold text-sm uppercase tracking-wider whitespace-nowrap border-b-2 transition-colors ${activeTab === 'DATA' ? 'border-[#0A2463] text-[#0A2463]' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
          >
            Datos Personales
          </button>
          <button
            onClick={() => setActiveTab('ALERTS')}
            className={`px-6 py-4 font-bold text-sm uppercase tracking-wider whitespace-nowrap border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'ALERTS' ? 'border-[#FF6B35] text-[#FF6B35]' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
          >
            <span className="material-symbols-outlined text-lg">notifications</span>
            Mis Alertas
          </button>
        </div>

        {activeTab === 'DATA' ? (
          <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
            <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8 space-y-6">
            {loading ? (
              <p className="text-slate-500">Cargando perfil...</p>
            ) : (
              <>
                <div className="grid gap-5 md:grid-cols-2">
                  <Field label="Nombre completo" error={validation.fullName}>
                    <input
                      type="text"
                      value={form.fullName}
                      onChange={(e) => handleChange('fullName', e.target.value)}
                      className={inputClass(validation.fullName)}
                      placeholder="Tu nombre completo"
                    />
                  </Field>

                  <Field label="Teléfono" error={validation.phone}>
                    <input
                      type="text"
                      value={form.phone}
                      onChange={(e) => handleChange('phone', normalizePhone(e.target.value))}
                      className={inputClass(validation.phone)}
                      placeholder="3001234567"
                    />
                  </Field>

                  <Field label="Estatura (cm)" error={validation.heightCm}>
                    <input
                      type="number"
                      min="140"
                      max="220"
                      value={form.heightCm}
                      onChange={(e) => handleChange('heightCm', e.target.value)}
                      className={inputClass(validation.heightCm)}
                      placeholder="176"
                    />
                  </Field>

                  <Field label="Ciudad de residencia" error={validation.city}>
                    <input
                      type="text"
                      value={form.city}
                      onChange={(e) => handleChange('city', e.target.value)}
                      className={inputClass(validation.city)}
                      placeholder="Bogotá"
                    />
                  </Field>
                </div>

                <Field label="Preferencias de marca" error={validation.preferredBrands}>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {availableBrands.map((brand) => {
                      const active = form.preferredBrands.includes(brand)
                      return (
                        <button
                          key={brand}
                          type="button"
                          onClick={() => toggleBrand(brand)}
                          className={`rounded-xl border px-4 py-3 text-sm font-semibold transition-colors text-left ${
                            active
                              ? 'border-[#FF6B35] bg-[#FF6B35]/5 text-[#FF6B35]'
                              : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-[#FF6B35]/40'
                          }`}
                        >
                          {brand}
                        </button>
                      )
                    })}
                  </div>
                </Field>

                {error && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 font-medium">
                    {success}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={!canSave}
                    className="flex-1 rounded-xl bg-[#0A2463] px-5 py-3 text-sm font-black uppercase tracking-widest text-white shadow-md transition-colors hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Guardando...' : 'Guardar cambios'}
                  </button>
                </div>
              </>
            )}
          </section>

          <aside className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8 space-y-4 h-fit">
            <h2 className="text-xl font-black text-[#0A2463]">Acciones rápidas</h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              Desde aquí también puedes cerrar tu sesión de forma segura.
            </p>
            <button
              type="button"
              onClick={handleLogout}
              className="w-full rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold uppercase tracking-widest text-slate-700 hover:bg-slate-50 transition-colors"
            >
              CERRAR SESIÓN
            </button>
          </aside>
        </form>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8 min-h-[400px]">
            <div className="mb-6">
              <h2 className="text-2xl font-black text-[#0A2463]">Alertas de Precio</h2>
              <p className="text-sm text-slate-500">
                Te notificaremos cuando el precio baje de tu objetivo. Puedes tener hasta 10 alertas activas.
              </p>
            </div>
            <PriceAlertList />
          </div>
        )}
      </main>
    </div>
  )
}

function Field({ label, error, children }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-bold text-slate-700">{label}</span>
      {children}
      {error && <span className="text-xs font-medium text-red-500">{error}</span>}
    </label>
  )
}

function inputClass(hasError) {
  return [
    'w-full rounded-xl border px-4 py-3 text-sm outline-none transition-colors bg-white',
    hasError ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100' : 'border-slate-200 focus:border-[#0A2463] focus:ring-2 focus:ring-[#0A2463]/10',
  ].join(' ')
}