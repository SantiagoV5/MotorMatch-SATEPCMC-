import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../../shared/components/layout/header';
import { getMyFavorites, removeFavorite } from '../services/favoritesService';

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatCOP(price, currency = 'COP') {
  if (!price) return 'Consultar';
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

function formatDate(isoString) {
  const date = new Date(isoString);
  const day = date.toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' });
  const time = date.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: true });
  return { day, time };
}

function getSegmentColor(segment) {
  switch (segment) {
    case 'Económica':  return 'bg-green-100 text-green-700';
    case 'Intermedia': return 'bg-blue-100 text-blue-700';
    case 'Premium':    return 'bg-purple-100 text-purple-700';
    default:           return 'bg-slate-100 text-slate-700';
  }
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function FavoriteSkeleton() {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow border border-primary/5 flex flex-col animate-pulse">
      <div className="h-40 bg-slate-200" />
      <div className="p-4 flex flex-col gap-3">
        <div className="h-5 bg-slate-200 rounded w-3/4" />
        <div className="h-3 bg-slate-100 rounded w-1/2" />
        <div className="h-3 bg-slate-100 rounded w-2/3" />
        <div className="h-8 bg-slate-100 rounded mt-2" />
      </div>
    </div>
  );
}

// ── Tarjeta de favorito ───────────────────────────────────────────────────────

function FavoriteCard({ moto, onRemove, removing }) {
  const navigate = useNavigate();
  const { day, time } = formatDate(moto.createdAt);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-lg border border-primary/5 flex flex-col group transition-all hover:shadow-xl hover:-translate-y-1">
      {/* Imagen */}
      <div
        className="relative h-40 overflow-hidden cursor-pointer"
        onClick={() => navigate(`/motorcycles/${moto.id}`)}
      >
        <img
          src={moto.imageUrl || 'https://images.unsplash.com/photo-1558980664-769d59546b3d?w=800&h=600&fit=crop'}
          alt={`${moto.brand} ${moto.model}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {/* Badge segmento */}
        <div className={`absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-bold shadow ${getSegmentColor(moto.segment)}`}>
          {moto.segment}
        </div>
      </div>

      {/* Contenido */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Título + botón corazón */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4
              className="text-lg font-black text-primary dark:text-slate-100 leading-tight cursor-pointer hover:text-accent transition-colors"
              onClick={() => navigate(`/motorcycles/${moto.id}`)}
            >
              {moto.brand} {moto.model}
            </h4>
            <button
              onClick={() => onRemove(moto.id)}
              disabled={removing}
              aria-label="Quitar de favoritos"
              className="flex-shrink-0 p-1 rounded-full transition-colors hover:bg-accent/10 disabled:opacity-50"
            >
              <span
                className="material-symbols-outlined text-xl transition-colors"
                style={{ fontVariationSettings: "'FILL' 1", color: '#FF6B35' }}
              >
                favorite
              </span>
            </button>
          </div>

          {/* Specs */}
          <div className="flex gap-4 text-slate-500 dark:text-slate-400 text-sm mb-3">
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">settings_input_component</span>
              <span>{moto.engineCc} cc</span>
            </div>
            {moto.powerHp && (
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">speed</span>
                <span>{Number(moto.powerHp)} HP</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer: precio + fecha */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex flex-col gap-1">
          <span className="text-xl font-black text-accent">
            {formatCOP(moto.price, moto.currency)}
          </span>
          <p className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
            <span className="material-symbols-outlined text-xs">calendar_today</span>
            Añadida el {day} a las {time}
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [removing, setRemoving] = useState(false);
  const navigate = useNavigate();

  const loadFavorites = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMyFavorites();
      setFavorites(data || []);
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/login');
      } else {
        setError('No se pudieron cargar los favoritos. Intenta de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const handleRemove = async (motorcycleId) => {
    setRemoving(true);
    try {
      await removeFavorite(motorcycleId);
      // Recarga la lista desde el servidor para reflejar el estado real
      await loadFavorites();
    } catch (err) {
      console.error('Error al quitar favorito:', err);
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background text-on-surface">
      <Header sticky={false} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-6 pb-16">

        {/* ── Hero header ── */}
        <header className="py-12 md:py-16 flex flex-col items-start gap-4">
          <h1 className="text-5xl md:text-6xl font-headline font-bold text-primary tracking-tighter leading-none mb-2">
            Mis Favoritas
          </h1>
          <p className="max-w-2xl text-on-surface-variant text-lg leading-relaxed font-body">
            Aquí se guardan las motos que más te gustan.
          </p>
          {!loading && (
            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-accent/10 text-accent rounded-full text-sm font-semibold">
              <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
              {favorites.length} {favorites.length === 1 ? 'moto guardada' : 'motos guardadas'}
            </span>
          )}
        </header>

        {/* ── Estado de error ── */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center mb-8">
            <span className="material-symbols-outlined text-red-400 text-5xl mb-3">error</span>
            <p className="text-red-700 font-medium mb-4">{error}</p>
            <button
              onClick={loadFavorites}
              className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-bold transition-colors"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* ── Skeletons mientras carga ── */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <FavoriteSkeleton key={i} />)}
          </div>
        )}

        {/* ── Grid de favoritos ── */}
        {!loading && !error && favorites.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {favorites.map(moto => (
              <FavoriteCard
                key={moto.favoriteId}
                moto={moto}
                onRemove={handleRemove}
                removing={removing}
              />
            ))}
          </div>
        )}

        {/* ── Estado vacío ── */}
        {!loading && !error && favorites.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-5 text-center">
            <span
              className="material-symbols-outlined text-slate-300 text-8xl"
              style={{ fontVariationSettings: "'FILL' 0" }}
            >
              favorite
            </span>
            <h2 className="text-2xl font-bold text-slate-500">Aún no tienes motos favoritas</h2>
            <p className="text-slate-400 max-w-xs">
              Presiona el corazón en cualquier moto del catálogo para guardarla aquí.
            </p>
            <button
              onClick={() => navigate('/')}
              className="mt-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-base">two_wheeler</span>
              Explorar catálogo
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-background border-t border-primary/10 py-12 px-4">
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
            <a className="text-slate-600 hover:text-accent font-medium transition-colors" href="#">Soporte</a>
            <a className="text-slate-600 hover:text-accent font-medium transition-colors" href="#">Contacto</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
