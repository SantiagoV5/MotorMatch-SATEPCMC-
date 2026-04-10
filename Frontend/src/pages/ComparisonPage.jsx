import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../shared/components/layout/header';
import { getAllMotorcycles, getMotorcycleById } from '../features/motorcycles/services/motorcycleService';
import { saveComparison } from '../features/comparison/services/comparisonService';

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatCOP(price) {
  if (!price) return 'Consultar';
  return new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', maximumFractionDigits: 0,
  }).format(price);
}

const MAX_SLOTS = 3;

// ── Skeleton de tarjeta en el picker ──────────────────────────────────────────
function PickerSkeleton() {
  return (
    <div className="animate-pulse flex items-center gap-4 p-3 rounded-xl border border-outline-variant/20 bg-surface-container-low">
      <div className="w-20 h-14 rounded-lg bg-slate-200 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-slate-200 rounded w-1/3" />
        <div className="h-4 bg-slate-200 rounded w-2/3" />
      </div>
    </div>
  );
}

// ── Modal picker de motos ─────────────────────────────────────────────────────
function MotoPicker({ onSelect, onClose, alreadySelected }) {
  const [search, setSearch] = useState('');
  const [committed, setCommitted] = useState('');
  const [motos, setMotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const load = useCallback(async (term) => {
    setLoading(true);
    try {
      const filters = term.trim() ? { search: term.trim() } : {};
      const data = await getAllMotorcycles(filters);
      setMotos(data || []);
    } catch {
      setMotos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(committed); }, [committed, load]);

  function handleSearch(e) {
    e.preventDefault();
    setCommitted(search);
  }

  const visible = motos.filter(m => !alreadySelected.includes(m.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl flex flex-col max-h-[80vh] overflow-hidden border border-outline-variant/20">

        {/* Header del modal */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-outline-variant/15">
          <h3 className="font-headline text-lg font-bold text-primary">Añadir moto</h3>
          <button onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full hover:bg-slate-100">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Barra de búsqueda */}
        <form onSubmit={handleSearch} className="px-6 py-3 border-b border-outline-variant/10">
          <div className="flex items-center gap-2 bg-surface-container rounded-lg px-3 py-2 border border-outline-variant/20">
            <span className="material-symbols-outlined text-outline text-xl">search</span>
            <input
              ref={inputRef}
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por marca, modelo..."
              className="flex-1 bg-transparent border-none outline-none text-sm text-on-surface placeholder:text-outline"
            />
            {search && (
              <button type="button" onClick={() => { setSearch(''); setCommitted(''); }}
                className="text-outline hover:text-on-surface transition-colors">
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            )}
            <button type="submit"
              className="bg-primary text-white px-3 py-1 rounded-md text-xs font-bold hover:bg-primary/90 transition-colors">
              Buscar
            </button>
          </div>
        </form>

        {/* Lista de motos */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2">
          {loading
            ? [...Array(5)].map((_, i) => <PickerSkeleton key={i} />)
            : visible.length === 0
              ? (
                <div className="flex flex-col items-center py-12 text-center gap-3">
                  <span className="material-symbols-outlined text-5xl text-slate-300">search_off</span>
                  <p className="text-slate-400 text-sm">No se encontraron motos</p>
                </div>
              )
              : visible.map(moto => (
                <div key={moto.id}
                  className="flex items-center gap-4 p-3 rounded-xl border border-outline-variant/20 hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer group"
                  onClick={() => onSelect(moto)}>
                  <img
                    src={moto.imageUrl || 'https://images.unsplash.com/photo-1558980664-769d59546b3d?w=200&h=140&fit=crop'}
                    alt={`${moto.brand} ${moto.model}`}
                    className="w-20 h-14 object-contain rounded-lg bg-slate-50 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-outline uppercase tracking-wider">{moto.brand}</p>
                    <p className="font-headline font-black text-primary text-base leading-tight truncate">{moto.model}</p>
                    {moto.year && <p className="text-xs text-slate-400">{moto.year}</p>}
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); onSelect(moto); }}
                    className="flex-shrink-0 bg-primary text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-primary/90 transition-colors opacity-0 group-hover:opacity-100">
                    Añadir
                  </button>
                </div>
              ))}
        </div>
      </div>
    </div>
  );
}

// ── Fila de comparación ───────────────────────────────────────────────────────
const ROWS = [
  { key: 'price',          label: 'Precio',             format: (v) => formatCOP(v) },
  { key: 'engineCc',       label: 'Cilindraje',         format: (v) => v ? `${v} cc` : '—' },
  { key: 'powerHp',        label: 'Potencia',           format: (v) => v ? `${Number(v)} HP` : '—' },
  { key: 'weightKg',       label: 'Peso',               format: (v) => v ? `${Number(v)} kg` : '—' },
  { key: 'seatHeightCm',   label: 'Altura de asiento',  format: (v) => v ? `${v} cm` : '—' },
  { key: 'consumptionKmpl',label: 'Consumo',            format: (v) => v ? `${Number(v)} km/l` : '—' },
  { key: 'transmission',   label: 'Transmisión',        format: (v) => v || '—' },
];

// ── Slot vacío ────────────────────────────────────────────────────────────────
function EmptySlot({ onClick }) {
  return (
    <div
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-3 p-8 rounded-2xl border-2 border-dashed border-outline-variant/40 bg-surface-container-low/30 hover:border-accent/60 hover:bg-accent/5 transition-all cursor-pointer group min-h-[260px]"
    >
      <div className="w-14 h-14 rounded-full border-2 border-dashed border-outline/30 flex items-center justify-center group-hover:border-accent group-hover:bg-accent/10 transition-all">
        <span className="material-symbols-outlined text-3xl text-outline group-hover:text-accent transition-colors">add</span>
      </div>
      <span className="font-headline text-xs font-bold text-outline uppercase tracking-widest group-hover:text-accent transition-colors">
        Añadir moto
      </span>
    </div>
  );
}

// ── Tarjeta de moto en la comparación ────────────────────────────────────────
function MotoCard({ moto, onRemove, navigate, highlights }) {
  return (
    <div className="flex flex-col rounded-2xl overflow-hidden border border-outline-variant/20 bg-surface-container-lowest shadow-sm">
      {/* Imagen + botón eliminar */}
      <div className="relative h-44 bg-slate-50">
        <img
          src={moto.imageUrl || 'https://images.unsplash.com/photo-1558980664-769d59546b3d?w=400&h=280&fit=crop'}
          alt={`${moto.brand} ${moto.model}`}
          className="w-full h-full object-contain p-3"
        />
        <button
          onClick={onRemove}
          className="absolute top-3 right-3 bg-accent/10 hover:bg-accent text-accent hover:text-white p-1.5 rounded-full transition-all"
          aria-label="Quitar de comparación"
        >
          <span className="material-symbols-outlined text-sm">close</span>
        </button>
      </div>

      {/* Nombre */}
      <div className="px-5 py-4 border-b border-outline-variant/10">
        <p className="font-headline text-xs font-bold text-outline uppercase tracking-wider">{moto.brand}</p>
        <p className="font-headline text-xl font-black text-primary leading-tight">{moto.model}</p>
        {moto.year && <p className="text-xs text-slate-400 mt-0.5">{moto.year}</p>}
      </div>

      {/* Atributos */}
      {ROWS.map(row => {
        const isHighlighted = highlights?.[row.key] === moto.id;
        return (
          <div
            key={row.key}
            className={`px-5 py-3 border-b border-outline-variant/10 flex flex-col gap-0.5 transition-colors ${
              isHighlighted ? 'bg-accent/10' : ''
            }`}
          >
            <span className="text-[10px] font-bold uppercase tracking-widest text-outline">{row.label}</span>
            <span className={`font-headline text-base font-bold ${isHighlighted ? 'text-accent' : 'text-primary'}`}>
              {row.format(moto[row.key])}
              {isHighlighted && (
                <span className="ml-2 text-[10px] font-bold text-accent uppercase tracking-wider">
                  {row.key === 'price' ? '★ Más barata' : '★ Mayor'}
                </span>
              )}
            </span>
          </div>
        );
      })}

      {/* CTA */}
      <div className="px-5 py-4">
        <button
          onClick={() => navigate(`/motorcycles/${moto.id}`)}
          className="w-full bg-primary text-white py-2.5 rounded-xl font-bold uppercase tracking-widest text-[11px] hover:bg-primary/90 transition-colors"
        >
          Ver detalle
        </button>
      </div>
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function ComparisonPage() {
  const navigate   = useNavigate();
  const location   = useLocation();

  // Prefill desde ficha técnica (una moto) o desde historial (array de 3 slots)
  const prefillMoto  = location.state?.prefillMoto  || null;
  const prefillSlots = location.state?.prefillSlots || null;

  const [slots, setSlots] = useState(() => {
    if (prefillSlots) return prefillSlots;                        // desde historial
    if (prefillMoto)  return [prefillMoto, null, null];           // desde ficha técnica
    return [null, null, null];
  });
  const [pickerSlot, setPickerSlot] = useState(null);   // índice del slot que se está llenando
  const [saved, setSaved]           = useState(false);   // si ya se guardó la comparación actual
  const savedRef                    = useRef('');  // guarda la key 'id1,id2[,id3]' ya persistida

  // ── Si los slots vienen del historial, enriquecer con datos completos ──────
  // prefillSlots solo trae {id, brand, model, imageUrl, engineCc}.
  // MotoCard necesita price, transmission, seatHeightCm, etc.
  useEffect(() => {
    if (!prefillSlots) return;
    const enrichSlots = async () => {
      const enriched = await Promise.all(
        prefillSlots.map(moto =>
          moto ? getMotorcycleById(moto.id).catch(() => moto) : null
        )
      );
      setSlots(enriched);
    };
    enrichSlots();
  }, []); // solo al montar

  // Motos activas (no null)
  const activeMotos = slots.filter(Boolean);

  // ── Calcular highlights cuando hay 2+ motos ──────────────────────────────
  const highlights = {};
  if (activeMotos.length >= 2) {
    // Precio más bajo → highlight
    const withPrice = activeMotos.filter(m => m.price != null);
    if (withPrice.length >= 2) {
      const cheapest = withPrice.reduce((a, b) => Number(a.price) < Number(b.price) ? a : b);
      highlights.price = cheapest.id;
    }
    // Cilindraje más alto → highlight
    const withCc = activeMotos.filter(m => m.engineCc != null);
    if (withCc.length >= 2) {
      const biggest = withCc.reduce((a, b) => a.engineCc > b.engineCc ? a : b);
      highlights.engineCc = biggest.id;
    }
  }

  // ── Guardar comparación en BD ────────────────────────────────────────────
  // savedRef guarda la combinación de IDs ya guardada (no solo un booleano)
  // así cuando se añade una 3ª moto se detecta que la combinación cambió y vuelve a guardar.
  useEffect(() => {
    const ids = activeMotos.map(m => m.id);
    const key = ids.join(',');
    if (ids.length < 2) {
      savedRef.current = '';
      setSaved(false);
      return;
    }
    if (savedRef.current === key) return;   // ya guardamos exactamente esta combinación
    savedRef.current = key;
    setSaved(true);
    saveComparison(ids).catch(() => { savedRef.current = ''; setSaved(false); });
  }, [activeMotos.map(m => m?.id).join(',')]);

  function handleSelect(moto) {
    setSlots(prev => {
      const next = [...prev];
      next[pickerSlot] = moto;
      return next;
    });
    setPickerSlot(null);
  }

  function handleRemove(idx) {
    setSlots(prev => {
      const next = [...prev];
      next[idx] = null;
      // Compactar para que no queden huecos en medio
      const filled = next.filter(Boolean);
      return [...filled, ...Array(MAX_SLOTS - filled.length).fill(null)];
    });
    savedRef.current = '';
    setSaved(false);
  }

  function handleClear() {
    setSlots([null, null, null]);
    savedRef.current = '';
    setSaved(false);
  }

  const alreadySelected = slots.filter(Boolean).map(m => m.id);

  return (
    <div className="min-h-screen bg-surface font-body text-on-surface">
      <Header sticky={false} />

      <main className="max-w-7xl mx-auto px-4 md:px-6 pb-20">

        {/* ── Hero header ── */}
        <div className="pt-10 pb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <h1 className="font-headline text-5xl md:text-6xl font-bold tracking-tighter text-primary uppercase leading-none">
              Batalla a <span className="text-accent italic">dos ruedas</span>
            </h1>
            <p className="mt-4 text-on-surface-variant max-w-xl font-medium text-sm leading-relaxed">
              Compara hasta 3 motocicletas en tiempo real. Se resalta el <span className="font-bold text-accent">mayor cilindraje</span> y el <span className="font-bold text-accent">mejor precio</span>.
            </p>
          </div>
          {activeMotos.length > 0 && (
            <div className="flex items-center gap-3 self-start md:self-auto">
            <button
              onClick={() => navigate('/comparison-history')}
              className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest border border-primary/20 px-4 py-2 rounded-lg hover:bg-primary/5 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">history</span>
              Historial
            </button>
            <button
              onClick={handleClear}
              className="flex items-center gap-2 text-accent font-bold text-xs uppercase tracking-widest border border-accent/20 px-4 py-2 rounded-lg hover:bg-accent/5 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">delete_sweep</span>
              Limpiar comparación
            </button>
          </div>
          )}
        </div>

        {/* ── Grid de slots ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {slots.map((moto, idx) =>
            moto ? (
              <MotoCard
                key={moto.id}
                moto={moto}
                onRemove={() => handleRemove(idx)}
                navigate={navigate}
                highlights={activeMotos.length >= 2 ? highlights : {}}
              />
            ) : (
              <EmptySlot key={idx} onClick={() => setPickerSlot(idx)} />
            )
          )}
        </div>

        {/* ── Indicador guardado ── */}
        {saved && (
          <p className="mt-6 text-center text-xs text-slate-400 flex items-center justify-center gap-1">
            <span className="material-symbols-outlined text-sm text-green-400">check_circle</span>
            Comparación guardada en tu historial
          </p>
        )}

      </main>

      {/* Modal picker */}
      {pickerSlot !== null && (
        <MotoPicker
          onSelect={handleSelect}
          onClose={() => setPickerSlot(null)}
          alreadySelected={alreadySelected}
        />
      )}

      {/* Footer */}
      <footer className="bg-white dark:bg-background-dark border-t border-primary/10 py-12 px-4 mt-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="flex items-center gap-2 text-primary dark:text-accent opacity-80">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 48 48">
                <path d="M36.7273 44C33.9891 44 31.6043 39.8386 30.3636 33.69C29.123 39.8386 26.7382 44 24 44C21.2618 44 18.877 39.8386 17.6364 33.69C16.3957 39.8386 14.0109 44 11.2727 44C7.25611 44 4 35.0457 4 24C4 12.9543 7.25611 4 11.2727 4C14.0109 4 16.3957 8.16144 17.6364 14.31C18.877 8.16144 21.2618 4 24 4C26.7382 4 29.123 8.16144 30.3636 14.31C31.6043 8.16144 33.9891 4 36.7273 4C40.7439 4 44 12.9543 44 24C44 35.0457 40.7439 44 36.7273 44Z" />
              </svg>
              <span className="font-bold">MotorMatch © 2026</span>
            </div>
            <p className="text-sm text-slate-500">Conectando pasiones, kilómetro a kilómetro.</p>
          </div>
          <nav className="flex flex-wrap justify-center gap-8">
            <a className="text-neutral-dark dark:text-slate-300 hover:text-accent font-medium transition-colors" href="#">Aviso Legal</a>
            <a className="text-neutral-dark dark:text-slate-300 hover:text-accent font-medium transition-colors" href="#">Privacidad</a>
            <a className="text-neutral-dark dark:text-slate-300 hover:text-accent font-medium transition-colors" href="#">Soporte</a>
            <a className="text-neutral-dark dark:text-slate-300 hover:text-accent font-medium transition-colors" href="#">Contacto</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
