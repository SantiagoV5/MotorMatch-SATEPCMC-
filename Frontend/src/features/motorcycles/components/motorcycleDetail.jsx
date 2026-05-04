import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../../shared/components/layout/header';
import MotorcycleImage from '../../../shared/components/MotorcycleImage';
import { addFavorite, removeFavorite, getMyFavoriteIds } from '../../favorites/services/favoritesService';
import { motorcycleService } from '../services/motorcycleService';
import { getMotorcycleReviews, createReview, updateReview, deleteReview } from '../services/reviewService';
import { CostSimulatorModal } from '../../costSimulator';
import MaintenanceEstimator from './MaintenanceEstimator';
import { PriceAlertModal } from '../../priceAlerts/components/PriceAlertModal';
import useAuth from '../../auth/hooks/useAuth';

export function MotorcycleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [motorcycle, setMotorcycle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [userBudget, setUserBudget] = useState(null);
  const { user, token } = useAuth();
  const userId = user?.id || null;
  const isAuthenticated = Boolean(token);
  const [reviewSummary, setReviewSummary] = useState({ averageRating: 0, totalReviews: 0 });
  const [reviews, setReviews] = useState([]);
  const [reviewsPage, setReviewsPage] = useState(1);
  const [reviewsHasMore, setReviewsHasMore] = useState(false);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsSubmitting, setReviewsSubmitting] = useState(false);
  const [reviewsError, setReviewsError] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [currentReviewId, setCurrentReviewId] = useState(null);

  // Load favorite status once motorcycle id is known.
  // Depends on motorcycle?.id (not the whole object) to avoid infinite re-renders.
  // ids are now plain numbers thanks to the toNumber() fix in the backend service.
  useEffect(() => {
    if (!motorcycle?.id) return;
    getMyFavoriteIds()
      .then(ids => setIsFavorite(ids.map(Number).includes(Number(motorcycle.id))))
      .catch(() => {});
  }, [motorcycle?.id]);

  // Get user profile info for budget
  useEffect(() => {
    setUserBudget(user?.budgetRange?.max || null);
  }, [user]);

  const handleFavoriteToggle = async () => {
    const next = !isFavorite;
    setIsFavorite(next);
    try {
      if (next) await addFavorite(motorcycle.id);
      else await removeFavorite(motorcycle.id);
    } catch (err) {
      setIsFavorite(!next);
      console.error('Error toggling favorite:', err);
    }
  };

  useEffect(() => {
    const fetchMotorcycle = async () => {
      try {
        setLoading(true);
        const data = await motorcycleService.getMotorcycleById(id);
        setMotorcycle(data);
        setCurrentImageIndex(0);
      } catch (error) {
        console.error('Error al cargar moto:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMotorcycle();
  }, [id]);

  useEffect(() => {
    if (!motorcycle?.id) return;
    loadReviews({ page: 1, append: false });
  }, [motorcycle?.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F7FA]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[#FF6B35]"></div>
      </div>
    );
  }

  if (!motorcycle) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#F5F7FA]">
        <p className="text-xl text-gray-600">Motocicleta no encontrada</p>
        <button
          onClick={() => navigate('/home')}
          className="px-6 py-2 bg-[#FF6B35] text-white rounded-lg hover:brightness-110 font-bold"
        >
          Volver al catálogo
        </button>
      </div>
    );
  }

  // Combinar imagen principal con galería y evitar duplicados.
  const allImages = Array.from(
    new Set([motorcycle.imageUrl, ...(motorcycle.galleryImages || [])].filter(Boolean))
  );
  const hasMultipleImages = allImages.length > 1;
  const currentHeroImage = allImages[currentImageIndex] || allImages[0];

  const handlePreviousImage = () => {
    if (!allImages.length) return;
    setCurrentImageIndex(previousIndex => (previousIndex - 1 + allImages.length) % allImages.length);
  };

  const handleNextImage = () => {
    if (!allImages.length) return;
    setCurrentImageIndex(previousIndex => (previousIndex + 1) % allImages.length);
  };

  const youtubeReferences = normalizeYoutubeReferences(motorcycle.referencesYT || motorcycle.youtubeReferences);

  const scrollToReviews = () => {
    const reviewsSection = document.getElementById('reviews-section');
    if (reviewsSection) {
      reviewsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const loadReviews = async ({ page = 1, append = false } = {}) => {
    if (!motorcycle?.id) return;

    setReviewsLoading(true);
    setReviewsError(null);

    try {
      const data = await getMotorcycleReviews(motorcycle.id, { page, limit: 5 });
      setReviewSummary(data.summary || { averageRating: 0, totalReviews: 0 });
      setReviewsHasMore(!!data.pagination?.hasMore);
      setReviewsPage(page);
      setCurrentReviewId(data.currentUserReview?.id || null);

      if (data.currentUserReview) {
        setReviewRating(data.currentUserReview.rating || 5);
        setReviewComment(data.currentUserReview.comment || '');
      } else if (!append) {
        setReviewRating(5);
        setReviewComment('');
      }

      setReviews((prev) => (append ? [...prev, ...(data.reviews || [])] : (data.reviews || [])));
    } catch (error) {
      console.error('Error al cargar reseñas:', error);
      setReviewsError('No se pudieron cargar las reseñas.');
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleHeroRatingClick = (rating) => {
    setReviewRating(rating);
    scrollToReviews();
  };

  const handleSaveReview = async (event) => {
    event.preventDefault();

    if (!isAuthenticated) {
      setReviewsError('Inicia sesión para escribir una reseña.');
      scrollToReviews();
      return;
    }

    setReviewsSubmitting(true);
    setReviewsError(null);

    try {
      const payload = {
        motorcycleId: motorcycle.id,
        rating: reviewRating,
        comment: reviewComment,
      };

      if (currentReviewId) {
        await updateReview(currentReviewId, payload);
      } else {
        await createReview(payload);
      }

      await loadReviews({ page: 1, append: false });
    } catch (error) {
      const message = error.response?.data?.message || 'No se pudo guardar la reseña.';
      setReviewsError(message);
    } finally {
      setReviewsSubmitting(false);
    }
  };

  const handleLoadMoreReviews = async () => {
    if (!reviewsHasMore || reviewsLoading) return;
    await loadReviews({ page: reviewsPage + 1, append: true });
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-[#F5F7FA] font-['Space_Grotesk'] text-[#2C3E50] antialiased">
      <Header sticky={false} />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-10 py-12">
        {/* Hero Section */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16 items-center">
          {/* Image */}
          <div className="relative">
            <div className="group relative aspect-video w-full overflow-hidden rounded-2xl bg-slate-100 shadow-xl">
              <MotorcycleImage
                key={currentHeroImage || 'hero-placeholder'}
                src={currentHeroImage}
                alt={`${motorcycle.brand} ${motorcycle.model} ${motorcycle.year} - imagen ${currentImageIndex + 1}`}
                className="h-full w-full p-3"
                loading="eager"
                style={{ objectFit: 'contain' }}
                fallbackLabel="Sin imagen"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/10" />

              {hasMultipleImages && (
                <>
                  <button
                    type="button"
                    onClick={handlePreviousImage}
                    aria-label="Imagen anterior"
                    className="absolute left-4 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm transition hover:bg-black/65 focus:outline-none focus:ring-2 focus:ring-white/70 md:h-12 md:w-12"
                  >
                    <span className="material-symbols-outlined text-2xl">chevron_left</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleNextImage}
                    aria-label="Siguiente imagen"
                    className="absolute right-4 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm transition hover:bg-black/65 focus:outline-none focus:ring-2 focus:ring-white/70 md:h-12 md:w-12"
                  >
                    <span className="material-symbols-outlined text-2xl">chevron_right</span>
                  </button>

                  <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-black/55 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.28em] text-white backdrop-blur-sm">
                    <span className="material-symbols-outlined text-sm text-[#FF6B35]">collections</span>
                    {currentImageIndex + 1} / {allImages.length}
                  </div>

                  <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/40 px-3 py-2 backdrop-blur-sm">
                    {allImages.map((_, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setCurrentImageIndex(index)}
                        aria-label={`Ver imagen ${index + 1}`}
                        className={`h-2.5 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-white/70 ${
                          index === currentImageIndex ? 'w-8 bg-white' : 'w-2.5 bg-white/50 hover:bg-white/80'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex flex-col justify-center space-y-6">
            <nav className="flex gap-2 text-xs font-bold tracking-widest text-[#FF6B35] uppercase">
              <span>{motorcycle.engineType || 'Motor'}</span>
              <span>•</span>
              <span>{motorcycle.year} Model</span>
            </nav>

            <div className="flex items-start justify-between gap-4">
              <h1 className="text-4xl md:text-5xl font-black tracking-tight text-[#0A2463] uppercase leading-tight">
                {motorcycle.brand} {motorcycle.model} {motorcycle.year}
              </h1>
              <button
                onClick={handleFavoriteToggle}
                aria-label="Añadir a favoritos"
                className="flex-shrink-0 mt-1 p-2 rounded-full transition-colors hover:bg-[#FF6B35]/10"
              >
                <span
                  className="material-symbols-outlined text-3xl transition-colors"
                  style={{
                    fontVariationSettings: isFavorite ? "'FILL' 1" : "'FILL' 0",
                    color: isFavorite ? '#FF6B35' : '#cbd5e1',
                  }}
                >
                  favorite
                </span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-1">
                <ReviewStars value={reviewSummary.averageRating} onRate={handleHeroRatingClick} />
              </div>
              <span className="text-2xl font-bold">{reviewSummary.averageRating.toFixed(1)}</span>
              <button
                type="button"
                onClick={scrollToReviews}
                className="text-slate-500 text-sm hover:text-[#FF6B35] transition-colors"
              >
                (reseñas y comentarios)
              </button>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-slate-500 font-medium">Precio sugerido</p>
              <p className="text-4xl font-bold text-[#0A2463] tracking-tight">
                ${parseFloat(motorcycle.price)?.toLocaleString('es-CO')} {motorcycle.currency || 'COP'}
              </p>
            </div>

            <div className="flex flex-wrap gap-4 pt-4">
              <button 
                onClick={() => setIsSimulatorOpen(true)}
                className="flex-1 min-w-[200px] h-14 bg-[#FF6B35] text-white rounded-xl font-bold hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#FF6B35]/20">
                <span className="material-symbols-outlined">calculate</span>
                SIMULAR COSTOS
              </button>
              <button
                onClick={() => navigate('/comparison', { state: { prefillMoto: motorcycle } })}
                className="flex-1 min-w-[200px] h-14 bg-[#0A2463] text-white rounded-xl font-bold hover:brightness-125 transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#0A2463]/20">
                <span className="material-symbols-outlined">compare_arrows</span>
                COMPARAR
              </button>
              <button
                onClick={() => setIsAlertOpen(true)}
                className="flex-1 min-w-[200px] h-14 bg-white border-2 border-[#0A2463] text-[#0A2463] rounded-xl font-bold hover:bg-[#0A2463] hover:text-white transition-all flex items-center justify-center gap-2 shadow-lg shadow-black/5">
                <span className="material-symbols-outlined">notifications_active</span>
                ALERTA DE PRECIO
              </button>
            </div>
          </div>
        </section>

        {/* Alerta de Precio Modal */}
        <PriceAlertModal
          isOpen={isAlertOpen}
          onClose={() => setIsAlertOpen(false)}
          motorcycle={motorcycle}
        />

        {/* Cost Simulator Modal */}
        <CostSimulatorModal
          motorcycle={motorcycle}
          userBudget={userBudget}
          userId={userId}
          isOpen={isSimulatorOpen}
          onClose={() => setIsSimulatorOpen(false)}
          onSave={(simulation) => console.log('Simulación guardada:', simulation)}
        />

        {/* Ficha Técnica */}
        <section className="mb-20">
          <h3 className="text-2xl font-bold mb-8 border-l-4 border-[#FF6B35] pl-4 text-[#0A2463]">
            Ficha Técnica
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <TechCard icon="settings_input_component" label="Cilindraje" value={`${motorcycle.engineCc} cc`} />
            <TechCard icon="bolt" label="Potencia" value={`${motorcycle.powerHp} HP`} />
            <TechCard icon="weight" label="Peso" value={`${motorcycle.weightKg} kg`} />
            <TechCard icon="gas_meter" label="Tanque" value={`${motorcycle.fuelTankLiters} L`} />
            <TechCard icon="settings_input_component" label="Torque Máx" value={`${motorcycle.torqueNm} Nm`} />
            <TechCard icon="height" label="Altura Asiento" value={`${motorcycle.seatHeightCm} cm`} />
            <TechCard icon="tire_repair" label="Frenos" value={motorcycle.brakeSystem} />
            <TechCard icon="speed" label="Transmisión" value={motorcycle.transmission} />
          </div>
        </section>

        {/* Referencias en YouTube */}
        {youtubeReferences.length > 0 && (
          <section className="mb-20">
            <div className="mb-8 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <h3 className="text-2xl font-bold border-l-4 border-[#FF6B35] pl-4 text-[#0A2463]">
                  Referencias en YouTube
                </h3>
              </div>
              <span className="hidden md:inline-flex items-center gap-2 self-start rounded-full bg-[#0A2463]/5 px-4 py-2 text-xs font-bold uppercase tracking-widest text-[#0A2463]">
                <span className="material-symbols-outlined text-base text-[#FF6B35]">smart_display</span>
                {youtubeReferences.length} videos
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {youtubeReferences.map((reference, index) => (
                <a
                  key={`${reference.url}-${index}`}
                  href={reference.url}
                  target="_blank"
                  rel="noreferrer"
                  className={`group overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl ${
                    youtubeReferences.length === 1 ? 'md:col-span-2' : ''
                  }`}
                >
                  <div className="relative aspect-video overflow-hidden bg-slate-100">
                    {reference.thumbnailUrl ? (
                      <img
                        src={reference.thumbnailUrl}
                        alt={`Referencia de YouTube ${index + 1}`}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#0A2463] to-[#1f3b8a] text-white">
                        <div className="text-center">
                          <span className="material-symbols-outlined text-6xl">play_circle</span>
                          <p className="mt-2 text-sm font-semibold uppercase tracking-[0.25em]">Ver en YouTube</p>
                        </div>
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

                    <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-black/60 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.3em] text-white backdrop-blur-sm">
                      <span className="material-symbols-outlined text-sm text-[#FF6B35]">smart_display</span>
                      Referencia {String(index + 1).padStart(2, '0')}
                    </div>

                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition-transform duration-300 group-hover:scale-110">
                        <span className="material-symbols-outlined text-4xl">play_circle</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">
                          Video de referencia
                        </p>
                        <h4 className="mt-2 text-xl font-bold text-[#0A2463] transition-colors group-hover:text-[#FF6B35]">
                          {reference.title}
                        </h4>
                      </div>
                      <span className="material-symbols-outlined text-[#FF6B35] transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1">
                        open_in_new
                      </span>
                    </div>

                    <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#FF6B35]/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-[#FF6B35]">
                      <span className="material-symbols-outlined text-base">smart_display</span>
                      Ver video
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Ventajas y Desventajas */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          {/* Ventajas */}
          <div className="bg-white border-t-4 border-[#28A745] rounded-xl p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <span className="material-symbols-outlined text-[#28A745] text-3xl">check_circle</span>
              <h3 className="text-xl font-bold text-[#28A745] tracking-tight">VENTAJAS</h3>
            </div>
            <ul className="space-y-5">
              {motorcycle.advantages && motorcycle.advantages.length > 0 ? (
                motorcycle.advantages.map((advantage, index) => (
                  <li key={index} className="flex items-start gap-4">
                    <span className="material-symbols-outlined text-[#28A745] text-lg shrink-0 mt-0.5">add</span>
                    <span className="font-medium">{advantage}</span>
                  </li>
                ))
              ) : (
                <li className="flex items-start gap-4">
                  <span className="material-symbols-outlined text-[#28A745] text-lg shrink-0 mt-0.5">add</span>
                  <span className="font-medium">Excelente relación precio-calidad</span>
                </li>
              )}
            </ul>
          </div>

          {/* Desventajas */}
          <div className="bg-white border-t-4 border-[#DC3545] rounded-xl p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <span className="material-symbols-outlined text-[#DC3545] text-3xl">cancel</span>
              <h3 className="text-xl font-bold text-[#DC3545] tracking-tight">DESVENTAJAS</h3>
            </div>
            <ul className="space-y-5">
              {motorcycle.disadvantages && motorcycle.disadvantages.length > 0 ? (
                motorcycle.disadvantages.map((disadvantage, index) => (
                  <li key={index} className="flex items-start gap-4">
                    <span className="material-symbols-outlined text-[#DC3545] text-lg shrink-0 mt-0.5">remove</span>
                    <span className="font-medium">{disadvantage}</span>
                  </li>
                ))
              ) : (
                <li className="flex items-start gap-4">
                  <span className="material-symbols-outlined text-[#DC3545] text-lg shrink-0 mt-0.5">remove</span>
                  <span className="font-medium">Información no disponible</span>
                </li>
              )}
            </ul>
          </div>
        </section>


        <MaintenanceEstimator motorcycle={motorcycle} />

        <section id="reviews-section" className="mb-20 scroll-mt-8 rounded-3xl border border-slate-100 bg-white p-6 md:p-8 shadow-sm">
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#FF6B35]">Reseñas y comentarios</p>
              <h3 className="mt-2 text-2xl font-black text-[#0A2463]">Reseñas y comentarios</h3>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                <span className="font-bold text-[#0A2463]">{reviewSummary.averageRating.toFixed(1)}</span>
                <span>·</span>
                <span>{reviewSummary.totalReviews} reseñas</span>
              </div>
            </div>

            <button
              type="button"
              onClick={scrollToReviews}
              className="inline-flex items-center gap-2 self-start rounded-full bg-[#0A2463]/5 px-4 py-2 text-xs font-bold uppercase tracking-widest text-[#0A2463]"
            >
              <span className="material-symbols-outlined text-base text-[#FF6B35]">rate_review</span>
              Escribir reseña
            </button>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-4">
              {reviewsError && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {reviewsError}
                </div>
              )}

              {reviewsLoading && reviews.length === 0 ? (
                <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-8 text-sm text-slate-500">
                  Cargando reseñas...
                </div>
              ) : reviews.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
                  Aún no hay reseñas para esta moto. Sé la primera persona en opinar.
                </div>
              ) : (
                reviews.map((review) => (
                  <article key={review.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-bold text-[#0A2463]">{review.user?.name || 'Usuario'}</p>
                        <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                          <ReviewStars value={review.rating} />
                          <span>{review.rating}/5</span>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-slate-400">
                        {new Intl.DateTimeFormat('es-CO', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        }).format(new Date(review.createdAt))}
                      </span>
                    </div>
                    <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-slate-700">
                      {review.comment}
                    </p>
                  </article>
                ))
              )}

              {reviewsHasMore && (
                <button
                  type="button"
                  onClick={handleLoadMoreReviews}
                  disabled={reviewsLoading}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-[#0A2463] transition-colors hover:bg-slate-50 disabled:opacity-60"
                >
                  {reviewsLoading ? 'Cargando...' : 'Cargar más reseñas'}
                </button>
              )}
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="mb-4">
                <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#FF6B35]">Tu comentario</p>
                <h4 className="mt-2 text-xl font-black text-[#0A2463]">
                  {currentReviewId ? 'Actualizar tu reseña' : 'Escribe tu reseña'}
                </h4>
                <p className="mt-2 text-sm text-slate-500">
                  Toca una estrella arriba, escribe tu experiencia y guárdala en este espacio.
                </p>
              </div>

              {!isAuthenticated && (
                <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  Inicia sesión para dejar tu reseña.
                </div>
              )}

              <form className="space-y-4" onSubmit={handleSaveReview}>
                <div>
                  <label className="mb-2 block text-sm font-bold text-[#1A202C]">Calificación</label>
                  <div className="flex items-center gap-2">
                    {Array.from({ length: 5 }, (_, index) => {
                      const value = index + 1;
                      const active = value <= reviewRating;

                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setReviewRating(value)}
                          className="transition-transform hover:scale-110"
                          aria-label={`Seleccionar ${value} estrellas`}
                        >
                          <span
                            className="material-symbols-outlined text-3xl"
                            style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0", color: active ? '#FF6B35' : '#cbd5e1' }}
                          >
                            star
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-[#1A202C]">Comentario</label>
                  <textarea
                    value={reviewComment}
                    onChange={(event) => setReviewComment(event.target.value)}
                    rows={6}
                    maxLength={500}
                    placeholder="Cuéntanos tu experiencia con esta moto..."
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition-colors focus:border-[#FF6B35]"
                  />
                  <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                    <span>Mínimo 20 caracteres</span>
                    <span>{reviewComment.length}/500</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={reviewsSubmitting || !isAuthenticated || reviewComment.trim().length < 20}
                  className="w-full rounded-2xl bg-[#FF6B35] px-5 py-3 text-sm font-black uppercase tracking-widest text-white transition-colors hover:brightness-110 disabled:opacity-60"
                >
                  {reviewsSubmitting ? 'Guardando...' : currentReviewId ? 'Actualizar reseña' : 'Publicar reseña'}
                </button>
              </form>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-[#0A2463] text-white/70 py-16 px-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-4 text-[#FF6B35] opacity-90">
            <div className="w-8 h-8">
              <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path d="M36.7273 44C33.9891 44 31.6043 39.8386 30.3636 33.69C29.123 39.8386 26.7382 44 24 44C21.2618 44 18.877 39.8386 17.6364 33.69C16.3957 39.8386 14.0109 44 11.2727 44C7.25611 44 4 35.0457 4 24C4 12.9543 7.25611 4 11.2727 4C14.0109 4 16.3957 8.16144 17.6364 14.31C18.877 8.16144 21.2618 4 24 4C26.7382 4 29.123 8.16144 30.3636 14.31C31.6043 8.16144 33.9891 4 36.7273 4C40.7439 4 44 12.9543 44 24C44 35.0457 40.7439 44 36.7273 44Z" fill="currentColor"></path>
              </svg>
            </div>
            <h2 className="text-lg font-bold tracking-tight text-white uppercase">MotorMatch Engine</h2>
          </div>
          <div className="flex gap-10 text-xs font-semibold uppercase tracking-widest">
            <a className="hover:text-[#FF6B35] transition-colors" href="#">Aviso Legal</a>
            <a className="hover:text-[#FF6B35] transition-colors" href="#">Privacidad</a>
            <a className="hover:text-[#FF6B35] transition-colors" href="#">Cookies</a>
          </div>
          <p className="text-[10px] text-white/40 max-w-xs text-center md:text-right">
            © 2024 MotorMatch Technical Engine. Todas las especificaciones están sujetas a cambios sin previo aviso según el fabricante.
          </p>
        </div>
      </footer>
    </div>
  );
}

// Componente auxiliar para tarjetas técnicas
function TechCard({ icon, label, value }) {
  return (
    <div className="p-6 rounded-2xl bg-white shadow-sm border border-slate-100 flex flex-col items-center text-center">
      <span className="material-symbols-outlined text-[#FF6B35] mb-3 text-3xl">{icon}</span>
      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">{label}</p>
      <p className="text-lg font-bold">{value}</p>
    </div>
  );
}

function normalizeYoutubeReferences(rawReferences) {
  if (!rawReferences) return [];

  let referencesSource = rawReferences;
  if (typeof referencesSource === 'string') {
    try {
      referencesSource = JSON.parse(referencesSource);
    } catch {
      return [];
    }
  }

  const referencesList = Array.isArray(referencesSource)
    ? referencesSource
    : Array.isArray(referencesSource?.videos)
      ? referencesSource.videos
      : Array.isArray(referencesSource?.references)
        ? referencesSource.references
        : Array.isArray(referencesSource?.links)
          ? referencesSource.links
          : [];

  return referencesList
    .map((item, index) => {
      const url = typeof item === 'string'
        ? item
        : item?.url || item?.link || item?.href || '';

      if (!url) return null;

      const videoId = extractYouTubeVideoId(url);

      return {
        title: typeof item === 'object' && item?.title ? item.title : `Referencia ${String(index + 1).padStart(2, '0')}`,
        url,
        thumbnailUrl: typeof item === 'object' && item?.thumbnailUrl
          ? item.thumbnailUrl
          : videoId
            ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
            : null,
      };
    })
    .filter(Boolean)
    .slice(0, 2);
}

function ReviewStars({ value, onRate = null }) {
  const numericValue = Number(value) || 0;
  const fullStars = Math.floor(numericValue);
  const hasHalfStar = numericValue - fullStars >= 0.5;

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, index) => {
        const starValue = index + 1;
        const active = starValue <= fullStars;
        const half = hasHalfStar && starValue === fullStars + 1;
        const content = half ? 'star_half' : 'star';

        if (onRate) {
          return (
            <button
              key={starValue}
              type="button"
              onClick={() => onRate(starValue)}
              className="transition-transform hover:scale-110"
              aria-label={`Calificar con ${starValue} estrellas`}
            >
              <span
                className="material-symbols-outlined text-[#FF6B35]"
                style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}
              >
                {content}
              </span>
            </button>
          );
        }

        return (
          <span
            key={starValue}
            className="material-symbols-outlined text-[#FF6B35]"
            style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}
          >
            {content}
          </span>
        );
      })}
    </div>
  );
}

function extractYouTubeVideoId(url) {
  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname.replace(/^www\./, '').toLowerCase();
    const isYouTubeHost = hostname === 'youtu.be' || hostname.endsWith('youtube.com') || hostname.endsWith('youtube-nocookie.com');

    if (!isYouTubeHost) return '';

    const searchVideoId = parsedUrl.searchParams.get('v');
    if (searchVideoId) return searchVideoId;

    const pathParts = parsedUrl.pathname.split('/').filter(Boolean);
    if (pathParts.length === 0) return '';

    if (hostname === 'youtu.be') {
      return pathParts[0] || '';
    }

    if (['shorts', 'embed', 'live'].includes(pathParts[0])) {
      return pathParts[1] || '';
    }

    return pathParts[pathParts.length - 1] || '';
  } catch {
    return '';
  }
}
