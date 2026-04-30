import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../shared/components/layout/header';
import { SUPPORT_MAILTO } from '../shared/constants/support';
import {
  getComparisonHistory,
  deleteComparison,
  deleteAllComparisons,
} from '../features/comparison/services/comparisonService';

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-CO', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
}

/**
 * [NUEVO] Mapa de etiquetas y colores para los tipos de comparación.
 * Permite mostrar el tipo de comparación de forma visual en cada tarjeta.
 */
const MODE_LABELS = {
  general:   { label: 'General',   icon: 'compare_arrows', color: 'bg-blue-100 text-blue-700' },
  economica: { label: 'Económica', icon: 'savings',        color: 'bg-green-100 text-green-700' },
  potencia:  { label: 'Potencia',  icon: 'bolt',           color: 'bg-orange-100 text-orange-700' },
  comodidad: { label: 'Comodidad', icon: 'accessibility',  color: 'bg-purple-100 text-purple-700' },
};

// ── Skeleton ──────────────────────────────────────────────────────────────────

function CardSkeleton() {
  return (
    <div className="animate-pulse bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col lg:flex-row overflow-hidden">
      <div className="flex-1 p-8 bg-slate-50 flex gap-8">
        {[0, 1].map(i => (
          <div key={i} className="flex-1 space-y-3">
            <div className="h-3 bg-slate-200 rounded w-1/3" />
            <div className="h-4 bg-slate-200 rounded w-2/3" />
            <div className="h-24 bg-slate-200 rounded" />
          </div>
        ))}
      </div>
      <div className="lg:w-72 p-8 space-y-4">
        <div className="h-3 bg-slate-200 rounded w-1/2" />
        <div className="h-10 bg-slate-200 rounded" />
        <div className="h-6 bg-slate-200 rounded w-1/3 mx-auto" />
      </div>
    </div>
  );
}

// ── Tarjeta de comparación ────────────────────────────────────────────────────

/**
 * [MODIFICADO] ComparisonCard ahora muestra el tipo de comparación
 * encima del botón "Ver comparación" usando la etiqueta del modo.
 */
function ComparisonCard({ comparison, onDelete, onView, deleting }) {
  const { bikes, comparisonDate, comparisonType, winnerBikeId } = comparison;

  const modeInfo   = MODE_LABELS[comparisonType] || MODE_LABELS.general;
  // winnerBikeId === null  → empate total registrado en BD
  // winnerBikeId === number → hay ganadora
  // winnerBikeId === undefined → comparación antigua sin el campo (no resaltar)
  const hasTie     = winnerBikeId === null && 'winnerBikeId' in comparison;
  const hasWinner  = typeof winnerBikeId === 'number';

  return (
    <article className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col lg:flex-row transition-shadow hover:shadow-md">

      {/* Motos */}
      <div className="flex-1 p-6 md:p-8 bg-slate-50/50 flex items-center">
        <div className="flex-1 flex items-center justify-around gap-2">
          {bikes.map((bike, idx) => {
            const isWinner = hasWinner && bike.id === winnerBikeId;
            const isTied   = hasTie;
            return (
            <div key={bike.id} className="flex items-center gap-2 flex-1 min-w-0">
              {/* Moto — resaltada si es ganadora (verde) o empate (gris) */}
              <div className={`group flex flex-col items-center text-center gap-2 flex-1 min-w-0 rounded-xl p-2 transition-all ${
                isWinner ? 'bg-emerald-50 ring-1 ring-emerald-300' : isTied ? 'bg-slate-100 ring-1 ring-slate-200' : ''
              }`}>
                {/* Badge ganadora o empate */}
                {isWinner && (
                  <span className="flex items-center gap-0.5 bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">
                    <span className="material-symbols-outlined text-[11px]">emoji_events</span> Ganadora
                  </span>
                )}
                {isTied && (
                  <span className="flex items-center gap-0.5 bg-slate-400 text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">
                    <span className="material-symbols-outlined text-[11px]">balance</span> Empate
                  </span>
                )}
                <p className={`text-[10px] font-bold uppercase tracking-widest truncate w-full ${isWinner ? 'text-emerald-600' : 'text-slate-400'}`}>{bike.brand}</p>
                <p className={`font-headline font-black text-sm leading-tight uppercase truncate w-full ${isWinner ? 'text-emerald-700' : 'text-primary'}`}>{bike.model}</p>
                <div className="w-full h-24 flex items-center justify-center">
                  <img
                    src={bike.imageUrl || 'https://images.unsplash.com/photo-1558980664-769d59546b3d?w=200&h=140&fit=crop'}
                    alt={`${bike.brand} ${bike.model}`}
                    className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:-translate-y-1"
                  />
                </div>
                {bike.engineCc && (
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${isWinner ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    {bike.engineCc}cc
                  </span>
                )}
              </div>
              {/* VS separador — solo entre motos, no al final */}
              {idx < bikes.length - 1 && (
                <div className="flex-shrink-0 w-10 flex items-center justify-center">
                  <span className="font-headline font-black text-xl text-slate-200 italic select-none">VS</span>
                </div>
              )}
            </div>
            );
          })}
        </div>
      </div>

      {/* Panel lateral */}
      <div className="lg:w-72 p-6 md:p-8 border-t lg:border-t-0 lg:border-l border-slate-100 flex flex-col justify-between gap-5">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-sm text-slate-400">calendar_today</span>
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400">{formatDate(comparisonDate)}</span>
        </div>

        <div className="flex flex-col gap-3 mt-auto">
          {/*
            [NUEVO] Etiqueta del tipo de comparación.
            Se muestra encima del botón "Ver comparación" indicando
            con qué tipo de comparación fue realizada.
          */}
          <div className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold ${modeInfo.color}`}>
            <span className="material-symbols-outlined text-sm">{modeInfo.icon}</span>
            Comparación {modeInfo.label}
          </div>

          <button
            onClick={() => onView(comparison)}
            className="w-full py-3 rounded-xl font-headline font-bold uppercase tracking-widest text-xs text-white flex items-center justify-center gap-2 transition-all active:scale-95"
            style={{ background: 'linear-gradient(135deg, #0A2463 0%, #0a2463 100%)' }}
          >
            Ver comparación
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>

          <button
            onClick={() => onDelete(comparison.id)}
            disabled={deleting === comparison.id}
            className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-red-500 transition-colors py-1 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-sm">delete</span>
            {deleting === comparison.id ? 'Eliminando...' : 'Eliminar'}
          </button>
        </div>
      </div>
    </article>
  );
}

// ── Modal de confirmación ─────────────────────────────────────────────────────

function ConfirmModal({ onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 flex flex-col items-center gap-5 text-center border border-slate-100">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
          <span className="material-symbols-outlined text-3xl text-red-500">delete_sweep</span>
        </div>
        <h3 className="text-xl font-bold text-primary font-headline">¿Borrar todo el historial?</h3>
        <p className="text-sm text-slate-500 leading-relaxed">
          Esta acción eliminará permanentemente <strong>todas</strong> tus comparaciones guardadas. No se puede deshacer.
        </p>
        <div className="flex gap-3 w-full mt-1">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                Borrando...
              </>
            ) : 'Sí, borrar todo'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────

export default function ComparisonHistoryPage() {
  const navigate = useNavigate();

  const [history, setHistory]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [deleting, setDeleting]         = useState(null);
  const [showConfirm, setShowConfirm]   = useState(false);
  const [clearLoading, setClearLoading] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getComparisonHistory();
      setHistory(data || []);
    } catch (err) {
      if (err.response?.status === 401) navigate('/login');
      else setError('No se pudo cargar el historial. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => { load(); }, [load]);

  async function handleDelete(id) {
    setDeleting(id);
    try {
      await deleteComparison(id);
      setHistory(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error('Error al eliminar comparación:', err);
    } finally {
      setDeleting(null);
    }
  }

  async function handleClearAll() {
    setClearLoading(true);
    try {
      await deleteAllComparisons();
      setHistory([]);
      setShowConfirm(false);
    } catch (err) {
      console.error('Error al borrar historial:', err);
    } finally {
      setClearLoading(false);
    }
  }

  /**
   * [MODIFICADO] Al ver los detalles de una comparación del historial,
   * se pasa también el tipo de comparación (prefillMode) en el state
   * para que ComparisonPage inicialice el modo correcto y ejecute la
   * comparación con ese tipo.
   */
  function handleView(comparison) {
    const motos = comparison.bikes.map(b => ({
      id: b.id, brand: b.brand, model: b.model,
      imageUrl: b.imageUrl, engineCc: b.engineCc,
    }));
    const slots = [motos[0] || null, motos[1] || null, motos[2] || null];
    navigate('/comparison', {
      state: {
        prefillSlots:   slots,
        prefillMode:    comparison.comparisonType || 'general',
        // Pasar el ID de la ganadora guardada en la BD para que ComparisonPage
        // la resalte directamente, sin necesidad de recalcular el score.
        // null significa empate total registrado; undefined = no enviado (backwards compat).
        prefillWinnerId: comparison.winnerBikeId ?? null,
      },
    });
  }

  return (
    <div className="min-h-screen bg-surface font-body text-on-surface">
      <Header sticky={false} />

      <main className="max-w-7xl mx-auto px-4 md:px-6 pb-20">

        {/* Hero header */}
        <div className="pt-10 pb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400 block mb-2">Dashboard de usuario</span>
            <h1 className="font-headline text-5xl md:text-6xl font-bold tracking-tighter text-primary uppercase leading-none">
              Historial de{' '}
              <span className="italic" style={{ color: '#FF6B35' }}>comparaciones</span>
            </h1>
            <p className="mt-4 text-slate-500 max-w-lg text-sm leading-relaxed">
              Revisa tus comparaciones previas y vuelve a verlas con un solo clic.
            </p>
          </div>

          {history.length > 0 && (
            <button
              onClick={() => setShowConfirm(true)}
              className="flex items-center gap-2 border-2 font-bold uppercase tracking-widest text-xs px-5 py-3 rounded-xl transition-all active:scale-95 self-start md:self-auto"
              style={{ borderColor: '#FF6B35', color: '#FF6B35' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#FF6B35'; e.currentTarget.style.color = 'white'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#FF6B35'; }}
            >
              <span className="material-symbols-outlined text-sm">delete_sweep</span>
              Borrar todo el historial
            </button>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center mb-8">
            <p className="text-red-700 font-medium mb-3">{error}</p>
            <button onClick={load} className="px-5 py-2 bg-red-500 text-white rounded-lg font-bold text-sm">Reintentar</button>
          </div>
        )}

        {/* Skeletons */}
        {loading && (
          <div className="space-y-8">
            {[0, 1, 2].map(i => <CardSkeleton key={i} />)}
          </div>
        )}

        {/* Lista */}
        {!loading && !error && history.length > 0 && (
          <div className="space-y-8">
            {history.map(comparison => (
              <ComparisonCard
                key={comparison.id}
                comparison={comparison}
                onDelete={handleDelete}
                onView={handleView}
                deleting={deleting}
              />
            ))}
            <p className="text-center text-xs text-slate-400 pt-2">
              Mostrando las {history.length} comparaciones más recientes
            </p>
          </div>
        )}

        {/* Estado vacío */}
        {!loading && !error && history.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-5 text-center">
            <span className="material-symbols-outlined text-8xl text-slate-200">compare_arrows</span>
            <h2 className="text-2xl font-bold text-slate-400 font-headline">Sin comparaciones aún</h2>
            <p className="text-slate-400 text-sm max-w-xs">
              Compara dos o más motos del catálogo para que queden guardadas aquí.
            </p>
            <button
              onClick={() => navigate('/comparison')}
              className="mt-2 px-6 py-3 text-white rounded-xl font-bold transition-colors flex items-center gap-2"
              style={{ backgroundColor: '#0A2463' }}
            >
              <span className="material-symbols-outlined text-base">compare_arrows</span>
              Ir a comparar
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-primary/10 py-12 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="flex items-center gap-2 text-primary opacity-80">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 48 48">
                <path d="M36.7273 44C33.9891 44 31.6043 39.8386 30.3636 33.69C29.123 39.8386 26.7382 44 24 44C21.2618 44 18.877 39.8386 17.6364 33.69C16.3957 39.8386 14.0109 44 11.2727 44C7.25611 44 4 35.0457 4 24C4 12.9543 7.25611 4 11.2727 4C14.0109 4 16.3957 8.16144 17.6364 14.31C18.877 8.16144 21.2618 4 24 4C26.7382 4 29.123 8.16144 30.3636 14.31C31.6043 8.16144 33.9891 4 36.7273 4C40.7439 4 44 12.9543 44 24C44 35.0457 40.7439 44 36.7273 44Z" />
              </svg>
              <span className="font-bold">MotorMatch © 2026</span>
            </div>
            <p className="text-sm text-slate-500">Conectando pasiones, kilómetro a kilómetro.</p>
          </div>
          <nav className="flex flex-wrap justify-center gap-8">
            <a className="text-slate-600 hover:text-accent font-medium transition-colors" href="#">Aviso Legal</a>
            <a className="text-slate-600 hover:text-accent font-medium transition-colors" href="#">Privacidad</a>
            <button onClick={() => navigate('/ayuda-faq')} className="text-slate-600 hover:text-accent font-medium transition-colors">
              Ayuda y FAQ
            </button>
            <a className="text-slate-600 hover:text-accent font-medium transition-colors" href={SUPPORT_MAILTO}>
              Contacto
            </a>
          </nav>
        </div>
      </footer>

      {/* Modal de confirmación borrar todo */}
      {showConfirm && (
        <ConfirmModal
          onConfirm={handleClearAll}
          onCancel={() => setShowConfirm(false)}
          loading={clearLoading}
        />
      )}
    </div>
  );
}
