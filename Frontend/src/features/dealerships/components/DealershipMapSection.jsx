import { useEffect, useMemo, useState } from 'react'
import { getDealershipsByMotorcycle } from '../services/dealershipService'

const MAP_WIDTH = 900
const MAP_HEIGHT = 380
const TILE_SIZE = 256

export default function DealershipMapSection({ motorcycle }) {
  const [dealerships, setDealerships] = useState([])
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [locating, setLocating] = useState(false)
  const [error, setError] = useState('')
  const [selectedId, setSelectedId] = useState(null)

  useEffect(() => {
    if (!motorcycle?.id) return
    loadDealerships()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [motorcycle?.id])

  async function loadDealerships(location = null) {
    try {
      setLoading(true)
      setError('')
      const response = await getDealershipsByMotorcycle(motorcycle.id, {
        limit: 12,
        ...(location || {}),
      })

      const items = response.data || []
      setDealerships(items)
      setMeta(response.meta || null)
      setSelectedId((current) => (items.some((item) => item.id === current) ? current : items[0]?.id || null))
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudieron cargar los concesionarios.')
    } finally {
      setLoading(false)
    }
  }

  function handleUseLocation() {
    if (!('geolocation' in navigator)) {
      setError('Geolocalizacion no disponible en este navegador.')
      return
    }

    setLocating(true)
    setError('')

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocating(false)
        loadDealerships({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
      },
      () => {
        setLocating(false)
        setError('No se pudo obtener tu ubicacion.')
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    )
  }

  const selectedDealership = useMemo(
    () => dealerships.find((item) => item.id === selectedId) || dealerships[0] || null,
    [dealerships, selectedId],
  )

  const resultLabel = meta?.resultMode === 'nearby'
    ? `Cerca de ti, hasta ${meta.maxDistanceKm} km`
    : meta?.fallback
      ? 'Principales del pais'
      : 'Red oficial'

  return (
    <section className="mb-20">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#FF6B35]">Concesionarios</p>
          <h2 className="mt-2 border-l-4 border-[#FF6B35] pl-4 text-2xl font-bold text-[#0A2463]">
            Concesionarios oficiales
          </h2>
          <p className="mt-2 text-sm font-semibold text-slate-500">{resultLabel}</p>
        </div>
        <button
          type="button"
          onClick={handleUseLocation}
          disabled={locating}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#0A2463]/15 bg-white px-5 py-3 text-sm font-black uppercase tracking-widest text-[#0A2463] shadow-sm transition hover:bg-[#0A2463]/5 disabled:opacity-60"
        >
          <span className="material-symbols-outlined text-lg">near_me</span>
          {locating ? 'Ubicando...' : 'Usar ubicacion'}
        </button>
      </div>

      {error && (
        <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
          {error}
        </div>
      )}

      {loading ? (
        <div className="min-h-[420px] animate-pulse rounded-2xl border border-slate-100 bg-white" />
      ) : dealerships.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-12 text-center text-sm font-semibold text-slate-500">
          Aun no hay concesionarios configurados para esta moto.
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <DealershipMap
            dealerships={dealerships}
            selectedId={selectedDealership?.id}
            onSelect={setSelectedId}
          />

          <div className="space-y-3">
            {dealerships.map((dealership) => (
              <DealershipCard
                key={dealership.id}
                dealership={dealership}
                active={dealership.id === selectedDealership?.id}
                onSelect={() => setSelectedId(dealership.id)}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

function DealershipMap({ dealerships, selectedId, onSelect }) {
  const mapModel = useMemo(() => buildMapModel(dealerships, selectedId), [dealerships, selectedId])

  return (
    <div className="relative h-[360px] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm md:h-[420px]">
      {mapModel.tiles.map((tile) => (
        <img
          key={`${tile.z}-${tile.x}-${tile.y}`}
          alt=""
          src={`https://tile.openstreetmap.org/${tile.z}/${tile.x}/${tile.y}.png`}
          className="absolute select-none"
          draggable="false"
          loading="lazy"
          style={{
            left: `${tile.left}%`,
            top: `${tile.top}%`,
            width: `${tile.width}%`,
            height: `${tile.height}%`,
          }}
        />
      ))}

      <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />

      {mapModel.markers.map((marker) => (
        <button
          key={marker.id}
          type="button"
          onClick={() => onSelect(marker.id)}
          className={`absolute flex h-11 w-11 -translate-x-1/2 -translate-y-full items-center justify-center rounded-full border-2 text-white shadow-lg transition hover:scale-105 ${
            marker.id === selectedId ? 'border-white bg-[#FF6B35]' : 'border-white/80 bg-[#0A2463]'
          }`}
          style={{ left: `${marker.left}%`, top: `${marker.top}%` }}
          aria-label={marker.name}
        >
          <span className="material-symbols-outlined text-xl">storefront</span>
        </button>
      ))}

      <a
        href="https://www.openstreetmap.org/copyright"
        target="_blank"
        rel="noreferrer"
        className="absolute bottom-2 right-2 rounded bg-white/90 px-2 py-1 text-[10px] font-semibold text-slate-600 shadow-sm"
      >
        OpenStreetMap
      </a>
    </div>
  )
}

function DealershipCard({ dealership, active, onSelect }) {
  const contact = dealership.contact || {}
  const hasContact = Boolean(contact.whatsappUrl || contact.phoneUrl || contact.website)

  return (
    <article className={`rounded-2xl border p-4 shadow-sm transition ${
      active ? 'border-[#FF6B35] bg-[#FF6B35]/5' : 'border-slate-100 bg-white'
    }`}>
      <button type="button" onClick={onSelect} className="block w-full text-left">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-black text-[#0A2463]">{dealership.name}</h3>
            <p className="mt-1 text-sm text-slate-600">{dealership.address}</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-slate-400">
              {[dealership.city, dealership.department].filter(Boolean).join(' / ') || 'Ubicacion registrada'}
            </p>
          </div>
          {dealership.distanceKm !== undefined && (
            <span className="rounded-full bg-[#0A2463]/10 px-3 py-1 text-xs font-black text-[#0A2463]">
              {dealership.distanceKm} km
            </span>
          )}
        </div>
      </button>

      <div className="mt-4 flex flex-wrap gap-2">
        {contact.whatsappUrl && (
          <ExternalButton href={contact.whatsappUrl} icon="chat" label="WhatsApp" />
        )}
        {contact.phoneUrl && (
          <ExternalButton href={contact.phoneUrl} icon="call" label="Llamar" />
        )}
        {contact.website && (
          <ExternalButton href={contact.website} icon="language" label="Web" />
        )}
        {contact.mapsUrl && (
          <ExternalButton href={contact.mapsUrl} icon="map" label="Maps" />
        )}
      </div>

      {!hasContact && (
        <p className="mt-4 rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-500">
          Contacto no disponible
        </p>
      )}
    </article>
  )
}

function ExternalButton({ href, icon, label }) {
  const isPhone = href.startsWith('tel:')
  return (
    <a
      href={href}
      target={isPhone ? undefined : '_blank'}
      rel={isPhone ? undefined : 'noreferrer'}
      className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-black uppercase tracking-widest text-[#0A2463] shadow-sm ring-1 ring-slate-200 transition hover:text-[#FF6B35]"
    >
      <span className="material-symbols-outlined text-base">{icon}</span>
      {label}
    </a>
  )
}

function buildMapModel(dealerships, selectedId) {
  const points = dealerships.filter((item) => Number.isFinite(item.latitude) && Number.isFinite(item.longitude))
  const selected = points.find((item) => item.id === selectedId)
  const zoom = getZoomForPoints(points)
  const center = selected || getCenter(points)
  const centerProjected = project(center.latitude, center.longitude, zoom)
  const topLeft = {
    x: centerProjected.x - MAP_WIDTH / 2,
    y: centerProjected.y - MAP_HEIGHT / 2,
  }

  const tileMinX = Math.floor(topLeft.x / TILE_SIZE)
  const tileMaxX = Math.floor((topLeft.x + MAP_WIDTH) / TILE_SIZE)
  const tileMinY = Math.floor(topLeft.y / TILE_SIZE)
  const tileMaxY = Math.floor((topLeft.y + MAP_HEIGHT) / TILE_SIZE)
  const tiles = []
  const maxTile = 2 ** zoom

  for (let x = tileMinX; x <= tileMaxX; x += 1) {
    for (let y = tileMinY; y <= tileMaxY; y += 1) {
      if (y < 0 || y >= maxTile) continue
      const wrappedX = ((x % maxTile) + maxTile) % maxTile
      tiles.push({
        z: zoom,
        x: wrappedX,
        y,
        left: ((x * TILE_SIZE - topLeft.x) / MAP_WIDTH) * 100,
        top: ((y * TILE_SIZE - topLeft.y) / MAP_HEIGHT) * 100,
        width: (TILE_SIZE / MAP_WIDTH) * 100,
        height: (TILE_SIZE / MAP_HEIGHT) * 100,
      })
    }
  }

  const markers = points.map((point) => {
    const projected = project(point.latitude, point.longitude, zoom)
    return {
      id: point.id,
      name: point.name,
      left: ((projected.x - topLeft.x) / MAP_WIDTH) * 100,
      top: ((projected.y - topLeft.y) / MAP_HEIGHT) * 100,
    }
  })

  return { tiles, markers }
}

function getCenter(points) {
  if (points.length === 0) return { latitude: 4.5709, longitude: -74.2973 }
  const totals = points.reduce((acc, point) => ({
    latitude: acc.latitude + point.latitude,
    longitude: acc.longitude + point.longitude,
  }), { latitude: 0, longitude: 0 })

  return {
    latitude: totals.latitude / points.length,
    longitude: totals.longitude / points.length,
  }
}

function getZoomForPoints(points) {
  if (points.length <= 1) return 13

  const latitudes = points.map((point) => point.latitude)
  const longitudes = points.map((point) => point.longitude)
  const span = Math.max(
    Math.max(...latitudes) - Math.min(...latitudes),
    Math.max(...longitudes) - Math.min(...longitudes),
  )

  if (span < 0.05) return 13
  if (span < 0.2) return 12
  if (span < 0.6) return 10
  if (span < 1.5) return 9
  if (span < 3) return 8
  if (span < 6) return 7
  return 6
}

function project(latitude, longitude, zoom) {
  const scale = TILE_SIZE * (2 ** zoom)
  const sinLat = Math.sin((latitude * Math.PI) / 180)

  return {
    x: ((longitude + 180) / 360) * scale,
    y: (0.5 - Math.log((1 + sinLat) / (1 - sinLat)) / (4 * Math.PI)) * scale,
  }
}
