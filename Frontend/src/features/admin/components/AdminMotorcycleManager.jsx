import { useEffect, useMemo, useState } from 'react'
import {
  createAdminMotorcycle,
  deleteAdminMotorcycle,
  getAdminMotorcycles,
  toggleAdminMotorcycleStatus,
  updateAdminMotorcycle,
} from '../services/adminMotorcycleService'
import { notifyMotorcycleCatalogUpdated } from '../../../shared/utils/motorcycleCatalogEvents'

const INITIAL_FORM = {
  brand: '',
  model: '',
  year: '',
  engineCc: '',
  engineType: '',
  powerHp: '',
  torqueNm: '',
  weightKg: '',
  seatHeightCm: '',
  fuelType: '',
  fuelTankLiters: '',
  consumptionKmpl: '',
  transmission: '',
  frontBrakeSystem: '',
  price: '',
  currency: 'COP',
  soatEstimated: '',
  registrationEstimated: '',
  imageUrl: '',
  galleryImages: '',
  referencesYT: '',
  description: '',
  advantages: '',
  disadvantages: '',
  source: '',
  externalIds: '',
  colors: '',
  countryOrigin: '',
  warranty: '',
  isActive: true,
}

const FORM_SECTIONS = [
  {
    title: 'Datos principales',
    fields: [
      { name: 'brand', label: 'Marca', type: 'text', required: true, placeholder: 'Yamaha' },
      { name: 'model', label: 'Modelo', type: 'text', required: true, placeholder: 'MT-07' },
      { name: 'year', label: 'Año', type: 'number', placeholder: '2025' },
      { name: 'price', label: 'Precio', type: 'number', required: true, placeholder: '48990000' },
      { name: 'currency', label: 'Moneda', type: 'text', placeholder: 'COP' },
      { name: 'imageUrl', label: 'Imagen principal', type: 'text', required: true, placeholder: 'https://...' },
      { name: 'source', label: 'Categoría / fuente', type: 'text', placeholder: 'Catalogo / API / Manual' },
      { name: 'isActive', label: 'Estado activo', type: 'checkbox' },
    ],
  },
  {
    title: 'Especificaciones técnicas',
    fields: [
      { name: 'engineCc', label: 'Cilindraje (cc)', type: 'number', placeholder: '689' },
      { name: 'engineType', label: 'Tipo de motor', type: 'text', placeholder: '2 cilindros' },
      { name: 'powerHp', label: 'Potencia (HP)', type: 'number', placeholder: '74' },
      { name: 'torqueNm', label: 'Torque (Nm)', type: 'number', placeholder: '68' },
      { name: 'weightKg', label: 'Peso (kg)', type: 'number', placeholder: '184' },
      { name: 'seatHeightCm', label: 'Altura de asiento (cm)', type: 'number', placeholder: '805' },
      { name: 'fuelType', label: 'Tipo de combustible', type: 'text', placeholder: 'Gasolina' },
      { name: 'fuelTankLiters', label: 'Tanque (L)', type: 'number', placeholder: '14' },
      { name: 'consumptionKmpl', label: 'Consumo (km/l)', type: 'number', placeholder: '25' },
      { name: 'transmission', label: 'Transmisión', type: 'text', placeholder: '6 velocidades' },
      { name: 'frontBrakeSystem', label: 'Freno delantero', type: 'text', placeholder: 'ABS doble canal' },
    ],
  },
  {
    title: 'Costos y origen',
    fields: [
      { name: 'soatEstimated', label: 'SOAT estimado', type: 'number', placeholder: '520000' },
      { name: 'registrationEstimated', label: 'Matrícula estimada', type: 'number', placeholder: '900000' },
      { name: 'countryOrigin', label: 'País de origen', type: 'text', placeholder: 'Japón' },
      { name: 'warranty', label: 'Garantía', type: 'text', placeholder: '12 meses o 20.000 km' },
    ],
  },
  {
    title: 'Contenido y metadata',
    fields: [
      { name: 'galleryImages', label: 'Galería de imágenes', type: 'textarea', placeholder: 'Una URL por línea' },
      { name: 'referencesYT', label: 'Referencias YouTube', type: 'textarea', placeholder: 'URL por línea o JSON' },
      { name: 'description', label: 'Descripción', type: 'textarea', required: true, placeholder: 'Describe la moto...' },
      { name: 'advantages', label: 'Ventajas', type: 'textarea', required: true, placeholder: 'Una ventaja por línea' },
      { name: 'disadvantages', label: 'Desventajas', type: 'textarea', required: true, placeholder: 'Una desventaja por línea' },
      { name: 'colors', label: 'Colores', type: 'textarea', placeholder: 'Un color por línea' },
      { name: 'externalIds', label: 'IDs externos', type: 'textarea', placeholder: 'JSON del identificador externo' },
    ],
  },
]

function parseListField(value) {
  return value
    .split(/[\n,;]/)
    .map((item) => item.trim())
    .filter(Boolean)
}

function formatTextArea(value) {
  if (!value) return ''
  if (Array.isArray(value)) return value.join('\n')
  if (typeof value === 'object') return JSON.stringify(value, null, 2)
  return String(value)
}

function toFormState(motorcycle) {
  if (!motorcycle) return { ...INITIAL_FORM }

  return {
    brand: motorcycle.brand || '',
    model: motorcycle.model || '',
    year: motorcycle.year?.toString() || '',
    engineCc: motorcycle.engineCc?.toString() || '',
    engineType: motorcycle.engineType || '',
    powerHp: motorcycle.powerHp?.toString() || '',
    torqueNm: motorcycle.torqueNm?.toString() || '',
    weightKg: motorcycle.weightKg?.toString() || '',
    seatHeightCm: motorcycle.seatHeightCm?.toString() || '',
    fuelType: motorcycle.fuelType || '',
    fuelTankLiters: motorcycle.fuelTankLiters?.toString() || '',
    consumptionKmpl: motorcycle.consumptionKmpl?.toString() || '',
    transmission: motorcycle.transmission || '',
    frontBrakeSystem: motorcycle.frontBrakeSystem || '',
    price: motorcycle.price?.toString() || '',
    currency: motorcycle.currency || 'COP',
    soatEstimated: motorcycle.soatEstimated?.toString() || '',
    registrationEstimated: motorcycle.registrationEstimated?.toString() || '',
    imageUrl: motorcycle.imageUrl || '',
    galleryImages: formatTextArea(motorcycle.galleryImages),
    referencesYT: formatTextArea(motorcycle.referencesYT),
    description: motorcycle.description || '',
    advantages: formatTextArea(motorcycle.advantages),
    disadvantages: formatTextArea(motorcycle.disadvantages),
    source: motorcycle.source || '',
    externalIds: formatTextArea(motorcycle.externalIds),
    colors: formatTextArea(motorcycle.colors),
    countryOrigin: motorcycle.countryOrigin || '',
    warranty: motorcycle.warranty || '',
    isActive: Boolean(motorcycle.isActive ?? true),
  }
}

function toPayload(form) {
  const parseOptionalNumber = (value) => (value === '' ? null : Number(value))

  let referencesYT = null
  if (form.referencesYT.trim()) {
    try {
      referencesYT = form.referencesYT.trim().startsWith('[') || form.referencesYT.trim().startsWith('{')
        ? JSON.parse(form.referencesYT)
        : parseListField(form.referencesYT)
    } catch {
      referencesYT = parseListField(form.referencesYT)
    }
  }

  let externalIds = null
  if (form.externalIds.trim()) {
    try {
      externalIds = JSON.parse(form.externalIds)
    } catch {
      externalIds = { raw: form.externalIds.trim() }
    }
  }

  return {
    brand: form.brand.trim(),
    model: form.model.trim(),
    year: form.year ? Number(form.year) : null,
    engineCc: form.engineCc ? Number(form.engineCc) : null,
    engineType: form.engineType.trim() || null,
    powerHp: parseOptionalNumber(form.powerHp),
    torqueNm: parseOptionalNumber(form.torqueNm),
    weightKg: parseOptionalNumber(form.weightKg),
    seatHeightCm: form.seatHeightCm ? Number(form.seatHeightCm) : null,
    fuelType: form.fuelType.trim() || null,
    fuelTankLiters: parseOptionalNumber(form.fuelTankLiters),
    consumptionKmpl: parseOptionalNumber(form.consumptionKmpl),
    transmission: form.transmission.trim() || null,
    frontBrakeSystem: form.frontBrakeSystem.trim() || null,
    price: Number(form.price),
    currency: form.currency.trim() || 'COP',
    soatEstimated: parseOptionalNumber(form.soatEstimated),
    registrationEstimated: parseOptionalNumber(form.registrationEstimated),
    imageUrl: form.imageUrl.trim(),
    galleryImages: parseListField(form.galleryImages),
    referencesYT,
    description: form.description.trim(),
    advantages: parseListField(form.advantages),
    disadvantages: parseListField(form.disadvantages),
    source: form.source.trim() || null,
    externalIds,
    colors: parseListField(form.colors),
    countryOrigin: form.countryOrigin.trim() || null,
    warranty: form.warranty.trim() || null,
    isActive: Boolean(form.isActive),
  }
}

function getValidationErrors(form) {
  const errors = {}

  if (!form.brand.trim()) errors.brand = 'La marca es obligatoria'
  if (!form.model.trim()) errors.model = 'El modelo es obligatorio'
  if (!form.price.trim() || Number.isNaN(Number(form.price))) errors.price = 'El precio debe ser numérico'
  if (!form.imageUrl.trim()) errors.imageUrl = 'La imagen es obligatoria'
  if (!form.description.trim() || form.description.trim().length < 10) errors.description = 'La descripción debe tener al menos 10 caracteres'
  if (!parseListField(form.advantages).length) errors.advantages = 'Agrega al menos una ventaja'
  if (!parseListField(form.disadvantages).length) errors.disadvantages = 'Agrega al menos una desventaja'

  return errors
}

function Field({ label, name, type = 'text', value, onChange, error, placeholder, required }) {
  const baseClass = `w-full rounded-2xl border bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15 ${error ? 'border-red-400' : 'border-slate-200'}`

  return (
    <div className="block space-y-1.5">
      <span className="text-sm font-bold text-slate-700">
        {label}
        {required && <span className="ml-1 text-[#FF6B35]">*</span>}
      </span>
      {type === 'textarea' ? (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={4}
          className={baseClass}
        />
      ) : type === 'checkbox' ? (
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
          <input
            name={name}
            type="checkbox"
            checked={Boolean(value)}
            onChange={onChange}
            className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
          />
          <span className="text-sm font-semibold text-slate-700">Activo en el catálogo público</span>
        </div>
      ) : (
        <input
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={baseClass}
        />
      )}
      {error && <p className="text-xs font-semibold text-red-500">{error}</p>}
    </div>
  )
}

function MotorcycleFormModal({ title, form, setForm, onClose, onSubmit, saving, error, validationErrors }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">Gestión de motos</p>
            <h3 className="mt-1 text-2xl font-black text-[#0A2463]">{title}</h3>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 transition hover:text-slate-600" aria-label="Cerrar formulario">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={onSubmit} className="flex-1 overflow-y-auto px-6 py-5">
          <div className="space-y-8">
            {FORM_SECTIONS.map((section) => (
              <section key={section.title} className="space-y-4">
                <div>
                  <h4 className="text-sm font-black uppercase tracking-[0.18em] text-[#FF6B35]">{section.title}</h4>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {section.fields.map((field) => (
                    <Field
                      key={field.name}
                      label={field.label}
                      name={field.name}
                      type={field.type}
                      value={form[field.name]}
                      onChange={(event) => {
                        const { name, type, checked, value } = event.target
                        setForm((current) => ({
                          ...current,
                          [name]: type === 'checkbox' ? checked : value,
                        }))
                      }}
                      error={validationErrors[field.name]}
                      placeholder={field.placeholder}
                      required={field.required}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>

          {error && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
              {error}
            </div>
          )}

          <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 transition hover:border-slate-400"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-primary px-5 py-3 text-sm font-black text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? 'Guardando...' : 'Guardar moto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function DeleteConfirmModal({ motorcycle, onCancel, onConfirm, deleting }) {
  if (!motorcycle) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-slate-100 bg-white p-7 shadow-2xl">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-500">
            <span className="material-symbols-outlined">warning</span>
          </div>
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">Eliminar moto</p>
            <h3 className="mt-2 text-xl font-black text-[#0A2463]">{motorcycle.brand} {motorcycle.model}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Esta acción eliminará la motocicleta del catálogo y no se puede deshacer.
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="flex-1 rounded-2xl bg-red-500 px-4 py-3 text-sm font-black text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {deleting ? 'Eliminando...' : 'Sí, eliminar'}
          </button>
        </div>
      </div>
    </div>
  )
}

function AdminMotorcycleManager({ onDataMutated }) {
  const [motorcycles, setMotorcycles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [formMode, setFormMode] = useState('create')
  const [editingMotorcycle, setEditingMotorcycle] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [form, setForm] = useState(INITIAL_FORM)
  const [validationErrors, setValidationErrors] = useState({})

  const activeCount = useMemo(() => motorcycles.filter((moto) => moto.isActive).length, [motorcycles])

  const loadMotorcycles = async () => {
    try {
      setLoading(true)
      const data = await getAdminMotorcycles()
      setMotorcycles(data)
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudieron cargar las motos del catálogo')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMotorcycles()
  }, [])

  function openCreateModal() {
    setFormMode('create')
    setEditingMotorcycle(null)
    setForm(INITIAL_FORM)
    setValidationErrors({})
    setError('')
    setSuccess('')
    setFormOpen(true)
  }

  function openEditModal(motorcycle) {
    setFormMode('edit')
    setEditingMotorcycle(motorcycle)
    setForm(toFormState(motorcycle))
    setValidationErrors({})
    setError('')
    setSuccess('')
    setFormOpen(true)
  }

  function closeForm() {
    setFormOpen(false)
    setEditingMotorcycle(null)
    setValidationErrors({})
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = getValidationErrors(form)
    setValidationErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      return
    }

    try {
      setSaving(true)
      setError('')
      setSuccess('')

      const payload = toPayload(form)
      if (formMode === 'create') {
        await createAdminMotorcycle(payload)
        notifyMotorcycleCatalogUpdated({ action: 'created', motorcycle: payload })
        setSuccess('Motocicleta creada correctamente')
      } else if (editingMotorcycle) {
        await updateAdminMotorcycle(editingMotorcycle.id, payload)
        notifyMotorcycleCatalogUpdated({ action: 'updated', motorcycle: payload })
        setSuccess('Motocicleta actualizada correctamente')
      }

      await loadMotorcycles()
      closeForm()
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo guardar la motocicleta')
    } finally {
      setSaving(false)
    }
  }

  async function handleToggleStatus(motorcycle) {
    try {
      setError('')
      onDataMutated?.()
      setSuccess('')
      await toggleAdminMotorcycleStatus(motorcycle.id)
      notifyMotorcycleCatalogUpdated({ action: 'status-changed', motorcycle })
      await loadMotorcycles()
      setSuccess(`Motocicleta ${motorcycle.isActive ? 'deshabilitada' : 'habilitada'} correctamente`)
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo cambiar el estado de la motocicleta')
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return

    try {
      setDeleting(true)
      setError('')
      setSuccess('')
      await deleteAdminMotorcycle(deleteTarget.id)
      notifyMotorcycleCatalogUpdated({ action: 'deleted', motorcycle: deleteTarget })
      await loadMotorcycles()
      setSuccess('Motocicleta eliminada correctamente')
      setDeleteTarget(null)
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo eliminar la motocicleta')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <section className="mt-10 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm md:p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">Gestión de catálogo</p>
          <h2 className="mt-2 text-3xl font-black text-[#0A2463]">Administrar motos</h2>
          <p className="mt-2 text-sm text-slate-500">
            {loading ? 'Cargando catálogo...' : `${motorcycles.length} motos registradas, ${activeCount} activas`}
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[#FF6B35] px-5 py-3 text-sm font-black text-white transition hover:brightness-110"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Agregar moto
        </button>
      </div>

      {error && (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
          {success}
        </div>
      )}

      <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-100">
        <table className="min-w-full divide-y divide-slate-100">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-[0.16em] text-slate-400">Marca</th>
              <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-[0.16em] text-slate-400">Modelo</th>
              <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-[0.16em] text-slate-400">Precio</th>
              <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-[0.16em] text-slate-400">Estado</th>
              <th className="px-4 py-3 text-right text-xs font-black uppercase tracking-[0.16em] text-slate-400">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-500">Cargando motos...</td>
              </tr>
            ) : motorcycles.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-500">No hay motos registradas todavía</td>
              </tr>
            ) : (
              motorcycles.map((motorcycle) => (
                <tr key={motorcycle.id} className="align-top">
                  <td className="px-4 py-4 text-sm font-bold text-slate-700">{motorcycle.brand}</td>
                  <td className="px-4 py-4 text-sm text-slate-600">{motorcycle.model}</td>
                  <td className="px-4 py-4 text-sm font-bold text-[#0A2463]">
                    {motorcycle.price ? new Intl.NumberFormat('es-CO', { style: 'currency', currency: motorcycle.currency || 'COP', maximumFractionDigits: 0 }).format(Number(motorcycle.price)) : 'Consultar'}
                  </td>
                  <td className="px-4 py-4 text-sm">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.16em] ${motorcycle.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                      {motorcycle.isActive ? 'Activa' : 'Deshabilitada'}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="inline-flex flex-wrap justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(motorcycle)}
                        className="rounded-full border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 transition hover:border-primary/20 hover:text-primary"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(motorcycle)}
                        className="rounded-full border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 transition hover:border-amber-200 hover:text-amber-700"
                      >
                        {motorcycle.isActive ? 'Deshabilitar' : 'Habilitar'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(motorcycle)}
                        className="rounded-full border border-red-200 px-3 py-2 text-xs font-bold text-red-600 transition hover:bg-red-50"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {formOpen && (
        <MotorcycleFormModal
          title={formMode === 'create' ? 'Agregar moto' : `Editar moto #${editingMotorcycle?.id}`}
          form={form}
          setForm={setForm}
          onClose={closeForm}
          onSubmit={handleSubmit}
          saving={saving}
          error={error}
          validationErrors={validationErrors}
        />
      )}

      {deleteTarget && (
        <DeleteConfirmModal
          motorcycle={deleteTarget}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          deleting={deleting}
        />
      )}
    </section>
  )
}

export default AdminMotorcycleManager