import { useEffect, useMemo, useState } from 'react'
import Header from '../shared/components/layout/header'
import { getAvailableBrands } from '../features/profile/services/profileService'
import { motorcycleService } from '../features/motorcycles/services/motorcycleService'
import {
  createAdminDealership,
  deactivateAdminDealership,
  getAdminDealerships,
  updateAdminDealership,
} from '../features/admin/services/dealershipAdminService'

const emptyForm = {
  name: '',
  address: '',
  city: '',
  department: '',
  latitude: '',
  longitude: '',
  phone: '',
  whatsapp: '',
  website: '',
  mapsUrl: '',
  isOfficial: true,
  isFeatured: false,
  priority: 0,
  isActive: true,
  brands: [],
  motorcycleIds: [],
}

function normalizePhone(value) {
  return value.replace(/[^0-9+\-\s()]/g, '')
}

function uniqueSortedValues(values) {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b, 'es'))
}

export default function DealershipAdminPage() {
  const [dealerships, setDealerships] = useState([])
  const [brands, setBrands] = useState([])
  const [motorcycles, setMotorcycles] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [filter, setFilter] = useState({ search: '', brand: '', status: 'active' })
  const [form, setForm] = useState(emptyForm)
  const [motorcycleSearch, setMotorcycleSearch] = useState('')

  const selectedDealership = useMemo(
    () => dealerships.find((item) => item.id === editingId) || null,
    [dealerships, editingId],
  )

  const filteredMotorcycles = useMemo(() => {
    const query = motorcycleSearch.trim().toLowerCase()
    const source = query
      ? motorcycles.filter((moto) =>
          `${moto.brand} ${moto.model} ${moto.year || ''}`.toLowerCase().includes(query),
        )
      : motorcycles

    return source.slice(0, 80)
  }, [motorcycleSearch, motorcycles])

  useEffect(() => {
    let mounted = true

    async function loadCatalog() {
      try {
        const [brandList, motorcycleList] = await Promise.all([
          getAvailableBrands(),
          motorcycleService.getAllMotorcycles({ limit: 500 }),
        ])

        if (!mounted) return
        const catalogBrands = uniqueSortedValues((motorcycleList || []).map((moto) => moto.brand))
        setBrands(Array.isArray(brandList) && brandList.length > 0 ? brandList : catalogBrands)
        setMotorcycles(motorcycleList)
      } catch (err) {
        if (mounted) setError(err.response?.data?.message || 'No se pudo cargar el catalogo.')
      }
    }

    loadCatalog()
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    loadDealerships()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter.status, filter.brand])

  async function loadDealerships(nextFilter = filter) {
    try {
      setLoading(true)
      setError('')
      const response = await getAdminDealerships({ ...nextFilter, limit: 100 })
      setDealerships(response.data || [])
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudieron cargar los concesionarios.')
    } finally {
      setLoading(false)
    }
  }

  function handleFilterSubmit(event) {
    event.preventDefault()
    loadDealerships(filter)
  }

  function handleChange(field, value) {
    setSuccess('')
    setError('')
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function toggleBrand(brand) {
    setForm((prev) => {
      const brandsValue = prev.brands.includes(brand)
        ? prev.brands.filter((item) => item !== brand)
        : [...prev.brands, brand]
      return { ...prev, brands: brandsValue }
    })
  }

  function toggleMotorcycle(motorcycleId) {
    setForm((prev) => {
      const isSelected = prev.motorcycleIds.includes(motorcycleId)
      const nextIds = isSelected
        ? prev.motorcycleIds.filter((id) => id !== motorcycleId)
        : [...prev.motorcycleIds, motorcycleId]
      const motorcycle = motorcycles.find((moto) => moto.id === motorcycleId)
      const nextBrands = !isSelected && motorcycle?.brand && !prev.brands.includes(motorcycle.brand)
        ? [...prev.brands, motorcycle.brand]
        : prev.brands

      return { ...prev, motorcycleIds: nextIds, brands: nextBrands }
    })
  }

  function resetForm() {
    setEditingId(null)
    setForm(emptyForm)
    setMotorcycleSearch('')
    setSuccess('')
    setError('')
  }

  function editDealership(dealership) {
    setEditingId(dealership.id)
    setForm({
      name: dealership.name || '',
      address: dealership.address || '',
      city: dealership.city || '',
      department: dealership.department || '',
      latitude: dealership.latitude ?? '',
      longitude: dealership.longitude ?? '',
      phone: dealership.phone || '',
      whatsapp: dealership.whatsapp || '',
      website: dealership.website || '',
      mapsUrl: dealership.mapsUrl || '',
      isOfficial: dealership.isOfficial !== false,
      isFeatured: Boolean(dealership.isFeatured),
      priority: dealership.priority || 0,
      isActive: dealership.isActive !== false,
      brands: dealership.brands || [],
      motorcycleIds: (dealership.motorcycles || []).map((item) => item.motorcycleId),
    })
    setSuccess('')
    setError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSuccess('')

    try {
      const payload = buildPayload(form)
      if (payload.brands.length === 0) {
        setError('Selecciona al menos una marca o una moto asociada antes de guardar.')
        return
      }

      setSaving(true)
      const saved = editingId
        ? await updateAdminDealership(editingId, payload)
        : await createAdminDealership(payload)

      setSuccess(editingId ? 'Concesionario actualizado.' : 'Concesionario creado.')
      setEditingId(saved.id)
      setForm((prev) => ({ ...prev, isActive: saved.isActive }))
      await loadDealerships()
    } catch (err) {
      const details = err.response?.data?.details
      setError(Array.isArray(details) ? details.join('; ') : err.response?.data?.message || 'No se pudo guardar.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDeactivate(id) {
    const confirmed = window.confirm('Desactivar este concesionario?')
    if (!confirmed) return

    try {
      setError('')
      await deactivateAdminDealership(id)
      setSuccess('Concesionario desactivado.')
      if (editingId === id) resetForm()
      await loadDealerships()
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo desactivar.')
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-slate-800">
      <Header sticky={false} />

      <main className="mx-auto max-w-7xl px-4 py-10 md:px-6">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 text-xs font-black uppercase tracking-[0.28em] text-[#FF6B35]">Administrador</p>
            <h1 className="text-4xl font-black tracking-tight text-[#0A2463] md:text-5xl">Concesionarios</h1>
          </div>
          <button
            type="button"
            onClick={resetForm}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0A2463] px-5 py-3 text-sm font-black uppercase tracking-widest text-white transition hover:brightness-110"
          >
            <span className="material-symbols-outlined text-lg">add_business</span>
            Nuevo
          </button>
        </div>

        {(error || success) && (
          <div className={`mb-6 rounded-xl border px-4 py-3 text-sm font-semibold ${
            error ? 'border-red-200 bg-red-50 text-red-700' : 'border-green-200 bg-green-50 text-green-700'
          }`}>
            {error || success}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm md:p-6">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.24em] text-slate-400">
                  {editingId ? `Editando #${editingId}` : 'Nuevo registro'}
                </p>
                <h2 className="mt-1 text-2xl font-black text-[#0A2463]">
                  {editingId ? selectedDealership?.name || 'Concesionario' : 'Datos del concesionario'}
                </h2>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Nombre">
                <input className={inputClass()} value={form.name} onChange={(e) => handleChange('name', e.target.value)} required />
              </Field>
              <Field label="Direccion">
                <input className={inputClass()} value={form.address} onChange={(e) => handleChange('address', e.target.value)} required />
              </Field>
              <Field label="Ciudad">
                <input className={inputClass()} value={form.city} onChange={(e) => handleChange('city', e.target.value)} />
              </Field>
              <Field label="Departamento">
                <input className={inputClass()} value={form.department} onChange={(e) => handleChange('department', e.target.value)} />
              </Field>
              <Field label="Latitud">
                <input className={inputClass()} type="number" step="0.0000001" value={form.latitude} onChange={(e) => handleChange('latitude', e.target.value)} required />
              </Field>
              <Field label="Longitud">
                <input className={inputClass()} type="number" step="0.0000001" value={form.longitude} onChange={(e) => handleChange('longitude', e.target.value)} required />
              </Field>
              <Field label="Telefono">
                <input className={inputClass()} value={form.phone} onChange={(e) => handleChange('phone', normalizePhone(e.target.value))} />
              </Field>
              <Field label="WhatsApp">
                <input className={inputClass()} value={form.whatsapp} onChange={(e) => handleChange('whatsapp', normalizePhone(e.target.value))} />
              </Field>
              <Field label="Sitio web">
                <input className={inputClass()} type="url" value={form.website} onChange={(e) => handleChange('website', e.target.value)} placeholder="https://..." />
              </Field>
              <Field label="Enlace Maps">
                <input className={inputClass()} type="url" value={form.mapsUrl} onChange={(e) => handleChange('mapsUrl', e.target.value)} placeholder="https://..." />
              </Field>
              <Field label="Prioridad">
                <input className={inputClass()} type="number" min="0" max="9999" value={form.priority} onChange={(e) => handleChange('priority', e.target.value)} />
              </Field>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <Toggle label="Oficial" checked={form.isOfficial} onChange={(value) => handleChange('isOfficial', value)} />
              <Toggle label="Destacado" checked={form.isFeatured} onChange={(value) => handleChange('isFeatured', value)} />
              <Toggle label="Activo" checked={form.isActive} onChange={(value) => handleChange('isActive', value)} />
            </div>

            <section className="mt-6">
              <h3 className="mb-3 text-sm font-black uppercase tracking-[0.2em] text-[#0A2463]">Marcas</h3>
              <div className="flex flex-wrap gap-2">
                {brands.map((brand) => {
                  const active = form.brands.includes(brand)
                  return (
                    <button
                      key={brand}
                      type="button"
                      onClick={() => toggleBrand(brand)}
                      className={`rounded-full border px-4 py-2 text-xs font-black uppercase tracking-widest transition ${
                        active ? 'border-[#FF6B35] bg-[#FF6B35] text-white' : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-[#FF6B35]/50'
                      }`}
                    >
                      {brand}
                    </button>
                  )
                })}
              </div>
            </section>

            <section className="mt-6">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-[#0A2463]">Motos asociadas</h3>
                <span className="text-xs font-bold text-slate-500">{form.motorcycleIds.length} seleccionadas</span>
              </div>
              <input
                className={inputClass()}
                value={motorcycleSearch}
                onChange={(e) => setMotorcycleSearch(e.target.value)}
                placeholder="Buscar por marca o modelo"
              />
              <div className="mt-3 max-h-72 overflow-y-auto rounded-xl border border-slate-100 bg-slate-50 p-2">
                {filteredMotorcycles.map((moto) => {
                  const active = form.motorcycleIds.includes(moto.id)
                  return (
                    <button
                      key={moto.id}
                      type="button"
                      onClick={() => toggleMotorcycle(moto.id)}
                      className={`mb-2 flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left transition last:mb-0 ${
                        active ? 'bg-[#0A2463] text-white' : 'bg-white text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span>
                        <span className="block text-xs font-black uppercase tracking-widest opacity-70">{moto.brand}</span>
                        <span className="block text-sm font-bold">{moto.model} {moto.year || ''}</span>
                      </span>
                      <span className="material-symbols-outlined text-lg">{active ? 'check_circle' : 'radio_button_unchecked'}</span>
                    </button>
                  )
                })}
              </div>
            </section>

            <button
              type="submit"
              disabled={saving}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#FF6B35] px-5 py-3 text-sm font-black uppercase tracking-widest text-white transition hover:brightness-110 disabled:opacity-60"
            >
              <span className="material-symbols-outlined text-lg">save</span>
              {saving ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear'}
            </button>
          </form>

          <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm md:p-6">
            <form onSubmit={handleFilterSubmit} className="mb-5 grid gap-3 md:grid-cols-[1fr_160px_150px_auto]">
              <input
                className={inputClass()}
                value={filter.search}
                onChange={(e) => setFilter((prev) => ({ ...prev, search: e.target.value }))}
                placeholder="Buscar"
              />
              <select className={inputClass()} value={filter.brand} onChange={(e) => setFilter((prev) => ({ ...prev, brand: e.target.value }))}>
                <option value="">Todas</option>
                {brands.map((brand) => <option key={brand} value={brand}>{brand}</option>)}
              </select>
              <select className={inputClass()} value={filter.status} onChange={(e) => setFilter((prev) => ({ ...prev, status: e.target.value }))}>
                <option value="active">Activos</option>
                <option value="inactive">Inactivos</option>
                <option value="all">Todos</option>
              </select>
              <button type="submit" className="rounded-xl bg-[#0A2463] px-5 py-3 text-sm font-black uppercase tracking-widest text-white">
                Filtrar
              </button>
            </form>

            {loading ? (
              <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-10 text-center text-sm font-semibold text-slate-500">
                Cargando concesionarios...
              </div>
            ) : dealerships.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm font-semibold text-slate-500">
                No hay concesionarios con esos filtros.
              </div>
            ) : (
              <div className="space-y-3">
                {dealerships.map((dealership) => (
                  <article key={dealership.id} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-black text-[#0A2463]">{dealership.name}</h3>
                          {!dealership.isActive && <Badge tone="slate">Inactivo</Badge>}
                          {dealership.isFeatured && <Badge tone="orange">Destacado</Badge>}
                        </div>
                        <p className="mt-1 text-sm text-slate-600">{dealership.address}</p>
                        <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-slate-400">
                          {[dealership.city, dealership.department].filter(Boolean).join(' / ') || 'Ubicacion registrada'}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {dealership.brands.map((brand) => <Badge key={brand} tone="blue">{brand}</Badge>)}
                        </div>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <button type="button" onClick={() => editDealership(dealership)} className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#0A2463] shadow-sm">
                          <span className="material-symbols-outlined text-lg">edit</span>
                        </button>
                        {dealership.isActive && (
                          <button type="button" onClick={() => handleDeactivate(dealership.id)} className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-600 shadow-sm">
                            <span className="material-symbols-outlined text-lg">block</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}

function buildPayload(form) {
  return {
    name: form.name.trim(),
    address: form.address.trim(),
    city: form.city.trim() || null,
    department: form.department.trim() || null,
    latitude: Number(form.latitude),
    longitude: Number(form.longitude),
    phone: form.phone.trim() || null,
    whatsapp: form.whatsapp.trim() || null,
    website: form.website.trim() || null,
    mapsUrl: form.mapsUrl.trim() || null,
    isOfficial: Boolean(form.isOfficial),
    isFeatured: Boolean(form.isFeatured),
    priority: Number.parseInt(form.priority, 10) || 0,
    isActive: Boolean(form.isActive),
    brands: form.brands,
    motorcycles: form.motorcycleIds.map((motorcycleId) => ({
      motorcycleId,
      isAvailable: true,
    })),
  }
}

function Field({ label, children }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-bold text-slate-700">{label}</span>
      {children}
    </label>
  )
}

function Toggle({ label, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
      <span className="text-sm font-bold text-slate-700">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-5 w-5 rounded border-slate-300 text-[#FF6B35] focus:ring-[#FF6B35]"
      />
    </label>
  )
}

function Badge({ children, tone }) {
  const tones = {
    blue: 'bg-[#0A2463]/10 text-[#0A2463]',
    orange: 'bg-[#FF6B35]/10 text-[#FF6B35]',
    slate: 'bg-slate-200 text-slate-600',
  }

  return (
    <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${tones[tone] || tones.slate}`}>
      {children}
    </span>
  )
}

function inputClass() {
  return 'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#FF6B35] focus:ring-2 focus:ring-[#FF6B35]/10'
}
