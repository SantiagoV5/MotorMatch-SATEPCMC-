import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllMotorcycles, getBrands } from '../features/motorcycles/services/motorcycleService';
import MotorcycleCard from '../features/motorcycles/components/motorcycleCard';
import MotorcycleSkeleton from '../features/motorcycles/components/motorcycleSkeleton';


// ----- price range constants for the slider -----
const MIN_PRICE = 5000000;
const MAX_PRICE = 50000000;


export default function HomePage() {
  const navigate = useNavigate();
  const [motorcycles, setMotorcycles] = useState([]);
  const [brandCounts, setBrandCounts] = useState({});
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [committedSearch, setCommittedSearch] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Filter states
  const [priceRange, setPriceRange] = useState([MIN_PRICE, MAX_PRICE]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedDisplacement, setSelectedDisplacement] = useState('');

  // Slider drag logic
  const trackRef = useRef(null);
  const dragging = useRef(null);

  const toPercent = (val) => ((val - MIN_PRICE) / (MAX_PRICE - MIN_PRICE)) * 100;

  const getValueFromClientX = useCallback((clientX) => {
    const rect = trackRef.current.getBoundingClientRect();
    const ratio = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
    return Math.round((MIN_PRICE + ratio * (MAX_PRICE - MIN_PRICE)) / 500) * 500;
  }, []);

  const startDrag = (thumb) => (e) => {
    e.preventDefault();
    dragging.current = thumb;
    const onMove = (ev) => {
      const clientX = ev.touches ? ev.touches[0].clientX : ev.clientX;
      const newVal = getValueFromClientX(clientX);
      setPriceRange((prev) => {
        if (dragging.current === 'min') {
          return newVal < prev[1] - 500 ? [newVal, prev[1]] : prev;
        } else {
          return newVal > prev[0] + 500 ? [prev[0], newVal] : prev;
        }
      });
    };
    const onUp = () => {
      dragging.current = null;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('touchend', onUp);
  };

  const minPct = toPercent(priceRange[0]);
  const maxPct = toPercent(priceRange[1]);

  const user = JSON.parse(sessionStorage.getItem('mm_user') || 'null');

  // Map displacement option values to minCc/maxCc the backend understands
  const DISPLACEMENT_CC = {
    low:     { minCc: 50,  maxCc: 200  },
    mid:     { minCc: 201, maxCc: 400  },
    high:    { minCc: 401, maxCc: 600  },
    premium: { minCc: 601, maxCc: null },
  };

  // Debounced price range — avoids firing a request on every pixel while dragging
  const [debouncedPrice, setDebouncedPrice] = useState(priceRange);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedPrice(priceRange), 100);
    return () => clearTimeout(t);
  }, [priceRange]);

  // Load brands once on mount
  useEffect(() => {
    getBrands()
      .then(data => setBrands(data || []))
      .catch(err => console.error('Error cargando marcas:', err));
  }, []);

  // Re-fetch motorcycles from the backend whenever any filter changes
  useEffect(() => {
    loadMotorcycles();
    loadBrandCounts();
  }, [debouncedPrice, selectedBrands, selectedDisplacement, committedSearch]);

  const loadMotorcycles = async () => {
    try {
      setLoading(true);
      setError(null);

      // Build filter object for the API
      const filters = {};

      // Price — only send if user moved the slider away from defaults
      if (debouncedPrice[0] !== MIN_PRICE) filters.minPrice = debouncedPrice[0];
      if (debouncedPrice[1] !== MAX_PRICE) filters.maxPrice = debouncedPrice[1];

      // Displacement cc range
      if (selectedDisplacement && DISPLACEMENT_CC[selectedDisplacement]) {
        const { minCc, maxCc } = DISPLACEMENT_CC[selectedDisplacement];
        if (minCc !== null) filters.minCc = minCc;
        if (maxCc !== null) filters.maxCc = maxCc;
      }

      // Search by text — only sent after user presses Buscar
      if (committedSearch.trim()) filters.search = committedSearch.trim();

      // Brand — backend accepts one brand at a time; we call once per brand and merge,
      // OR send the first selected brand if only one is chosen.
      // For multiple brands we fetch each and deduplicate by id.
      if (selectedBrands.length === 1) {
        filters.brand = selectedBrands[0];
        const data = await getAllMotorcycles(filters);
        setMotorcycles(data || []);
      } else if (selectedBrands.length > 1) {
        const results = await Promise.all(
          selectedBrands.map(brand => getAllMotorcycles({ ...filters, brand }))
        );
        // Merge and deduplicate by id
        const merged = Object.values(
          results.flat().reduce((acc, moto) => { acc[moto.id] = moto; return acc; }, {})
        );
        setMotorcycles(merged);
      } else {
        // No brand filter
        const data = await getAllMotorcycles(filters);
        setMotorcycles(data || []);
      }
    } catch (err) {
      console.error('Error cargando motos:', err);
      setError('No se pudieron cargar las motos. Intenta de nuevo');
    } finally {
      setLoading(false);
    }
  };

  // Keep loadData as a simple alias so the "Reintentar" button still works
  const loadData = loadMotorcycles;

  // Fetches motorcycle counts per brand using the active price/cc/search filters
  // but WITHOUT the brand filter, so all brands always show their correct count.
  const loadBrandCounts = async () => {
    try {
      const filters = {};
      if (debouncedPrice[0] !== MIN_PRICE) filters.minPrice = debouncedPrice[0];
      if (debouncedPrice[1] !== MAX_PRICE) filters.maxPrice = debouncedPrice[1];
      if (selectedDisplacement && DISPLACEMENT_CC[selectedDisplacement]) {
        const { minCc, maxCc } = DISPLACEMENT_CC[selectedDisplacement];
        if (minCc !== null) filters.minCc = minCc;
        if (maxCc !== null) filters.maxCc = maxCc;
      }
      if (committedSearch.trim()) filters.search = committedSearch.trim();
      // No brand filter here — we want counts for ALL brands
      const data = await getAllMotorcycles({ ...filters, limit: 500 });
      const counts = (data || []).reduce((acc, moto) => {
        const brand = (moto.brand || '').toUpperCase();
        acc[brand] = (acc[brand] || 0) + 1;
        return acc;
      }, {});
      setBrandCounts(counts);
    } catch (err) {
      console.error('Error cargando conteos por marca:', err);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('mm_token');
    sessionStorage.removeItem('mm_user');
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCommittedSearch(searchTerm);   // triggers useEffect → loadMotorcycles
  };

  const handleBrandToggle = (brand) => {
    setSelectedBrands(prev =>
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
  };

  const handleResetFilters = () => {
    setPriceRange([MIN_PRICE, MAX_PRICE]);
    setSelectedBrands([]);
    setSelectedDisplacement('');
    setSearchTerm('');
    setCommittedSearch('');
  };

  const activeFilterCount =
    selectedBrands.length +
    (selectedDisplacement ? 1 : 0) +
    (priceRange[0] !== MIN_PRICE || priceRange[1] !== MAX_PRICE ? 1 : 0);

  const getBrandLogo = (brand) => {
    const logos = {
      'AKT': 'https://cloudfront-us-east-1.images.arcpublishing.com/elespectador/4FRZGTJONRENZGGGUP4HPFLP3Q.jpg',
      'SUZUKI': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Suzuki_Motor_Corporation_logo.svg/1280px-Suzuki_Motor_Corporation_logo.svg.png',
      'YAMAHA': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRmPoWWy2WFpEU_4oOCu_mqO_LkUkEbVGODqw&s',
      'BAJAJ': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSw3RzT2dBxuMpDYb8k__NMPOZju_joi5RHEg&s',
      'HONDA': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Honda_Logo.svg/330px-Honda_Logo.svg.png',
      'TVS': 'https://i.pinimg.com/736x/15/50/91/155091f7e6e708676b72a12f6717983e.jpg',
      'KAWASAKI': 'https://upload.wikimedia.org/wikipedia/commons/1/15/Kawasaki_Logo_vert.svg',
      'VICTORY': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRfxPD26PLGfdHYqAbAWfA3Pzepy1UOIvk_hQ&s'
    };
    return logos[brand.toUpperCase()] || null;
  };

  const displacementOptions = [
    { label: 'Bajo (50cc - 200cc)',   subtitle: 'Ideal para principiantes', value: 'low'     },
    { label: 'Medio (201cc - 400cc)', subtitle: 'Para uso mixto',           value: 'mid'     },
    { label: 'Alto (401cc - 600cc)',  subtitle: 'Experiencia intermedia',   value: 'high'    },
    { label: 'Premium (601cc+)',      subtitle: 'Alta cilindrada',          value: 'premium' },
  ];

  const filterBrands = brands.length > 0 ? brands : ['YAMAHA', 'HONDA', 'BAJAJ', 'KAWASAKI'];

  // brandCounts comes from a separate query without brand filter — always shows all brands
  const countByBrand = brandCounts;


  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark text-neutral-dark dark:text-slate-100">

      {/* Filter Overlay */}
      {isFilterOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={() => setIsFilterOpen(false)}
        />
      )}


      {/* ----- filters side menu ----- */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-72 bg-white dark:bg-slate-900 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          isFilterOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary dark:text-accent text-xl">tune</span>
            <h2 className="font-bold text-base text-primary dark:text-slate-100">Filtros</h2>
            {activeFilterCount > 0 && (
              <span className="bg-accent text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {activeFilterCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {activeFilterCount > 0 && (
              <button
                onClick={handleResetFilters}
                className="text-xs font-semibold text-accent hover:text-accent/80 transition-colors"
              >
                Limpiar
              </button>
            )}
            <button
              onClick={() => setIsFilterOpen(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              aria-label="Cerrar filtros"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>
        </div>

        {/* Sidebar Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">

          {/* ----- price range bar ----- */}
          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-6">
              Rango de Precio
            </p>
            <div className="px-2">
              {/* Track container — ref para calcular posición del cursor */}
              <div
                ref={trackRef}
                className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full relative select-none"
              >
                {/* Relleno activo entre los dos thumbs */}
                <div
                  className="absolute h-full rounded-full"
                  style={{
                    left: `${minPct}%`,
                    width: `${maxPct - minPct}%`,
                    backgroundColor: '#f97316', // accent orange
                  }}
                />
                {/* Thumb mínimo */}
                <div
                  className="absolute -top-[5px] w-4 h-4 bg-white border-2 rounded-full cursor-grab active:cursor-grabbing shadow-sm transition-transform hover:scale-110"
                  style={{
                    left: `${minPct}%`,
                    transform: 'translateX(-50%)',
                    borderColor: '#f97316',
                    zIndex: 2,
                  }}
                  onMouseDown={startDrag('min')}
                  onTouchStart={startDrag('min')}
                />
                {/* Thumb máximo */}
                <div
                  className="absolute -top-[5px] w-4 h-4 bg-white border-2 rounded-full cursor-grab active:cursor-grabbing shadow-sm transition-transform hover:scale-110"
                  style={{
                    left: `${maxPct}%`,
                    transform: 'translateX(-50%)',
                    borderColor: '#f97316',
                    zIndex: 2,
                  }}
                  onMouseDown={startDrag('max')}
                  onTouchStart={startDrag('max')}
                />
              </div>

              {/* Valores mín/máx */}
              <div className="flex justify-between mt-4">
                <span className="text-xs font-medium px-2 py-1 bg-background-light dark:bg-slate-800 rounded">
                  ${priceRange[0].toLocaleString()}
                </span>
                <span className="text-xs font-medium px-2 py-1 bg-background-light dark:bg-slate-800 rounded">
                  ${priceRange[1].toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Brand Filter */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-3">
              Marca
            </h3>
            <div className="space-y-1">
              {filterBrands.map((brand) => {
                const isChecked = selectedBrands.includes(brand);
                const count = countByBrand[brand.toUpperCase()] || 0;
                return (
                  <label
                    key={brand}
                    className={`flex items-center justify-between gap-3 px-2 py-1.5 rounded-lg cursor-pointer transition-colors ${
                      isChecked
                        ? 'bg-orange-50 dark:bg-orange-950/30'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Custom checkbox orange */}
                      <div
                        className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                          isChecked
                            ? 'bg-[#f97316] border-[#f97316]'
                            : 'border-slate-300 dark:border-slate-600'
                        }`}
                        onClick={() => handleBrandToggle(brand)}
                      >
                        {isChecked && (
                          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 10 10">
                            <path d="M1.5 5L4 7.5L8.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </div>
                      <span className={`text-sm font-medium transition-colors ${
                        isChecked ? 'text-[#f97316]' : 'text-slate-700 dark:text-slate-300'
                      }`}>
                        {brand}
                      </span>
                    </div>

                    {/* ----- motorcycle counter by brand ----- */}
                    {!loading && count > 0 && (
                      <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full transition-colors ${
                        isChecked
                          ? 'bg-[#f97316] text-white'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                      }`}>
                        {count}
                      </span>
                    )}
                  </label>
                );
              })}
            </div>
          </div>

          {/* Displacement Filter */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-3">
              Cilindraje
            </h3>
            <div className="space-y-1">
              {displacementOptions.map((option) => {
                const isSelected = selectedDisplacement === option.value;
                return (
                  <label
                    key={option.value}
                    className={`flex items-center gap-3 px-2 py-1.5 rounded-lg cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-orange-50 dark:bg-orange-950/30'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {/* Custom radio naranja */}
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors mt-0.5 ${
                        isSelected
                          ? 'border-[#f97316]'
                          : 'border-slate-300 dark:border-slate-600'
                      }`}
                      onClick={() => setSelectedDisplacement(prev => prev === option.value ? '' : option.value)}
                    >
                      {isSelected && (
                        <div className="w-2 h-2 rounded-full bg-[#f97316]" />
                      )}
                    </div>
                    <div className="flex flex-col" onClick={() => setSelectedDisplacement(prev => prev === option.value ? '' : option.value)}>
                      <span className={`text-sm font-medium transition-colors ${
                        isSelected ? 'text-[#f97316]' : 'text-slate-700 dark:text-slate-300'
                      }`}>
                        {option.label}
                      </span>
                      <span className="text-xs text-slate-400 dark:text-slate-500">{option.subtitle}</span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

        </div>

        {/* Sidebar Footer */}
        <div className="px-5 py-4 border-t border-slate-200 dark:border-slate-700">
          <p className="text-xs text-center text-slate-400 dark:text-slate-500 mb-3">
            {loading ? 'Buscando...' : `${motorcycles.length} moto${motorcycles.length !== 1 ? 's' : ''} encontrada${motorcycles.length !== 1 ? 's' : ''}`}
          </p>
        </div>
      </aside>


      {/* Navigation Bar */}
      <header className="fixed top-0 left-0 z-30 w-full bg-white dark:bg-background-dark border-b border-primary/10 px-4 md:px-6 py-3 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between gap-4 mb-3">
            <div className="flex items-center gap-2">
              <div className="text-primary dark:text-accent">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 48 48">
                  <path d="M36.7273 44C33.9891 44 31.6043 39.8386 30.3636 33.69C29.123 39.8386 26.7382 44 24 44C21.2618 44 18.877 39.8386 17.6364 33.69C16.3957 39.8386 14.0109 44 11.2727 44C7.25611 44 4 35.0457 4 24C4 12.9543 7.25611 4 11.2727 4C14.0109 4 16.3957 8.16144 17.6364 14.31C18.877 8.16144 21.2618 4 24 4C26.7382 4 29.123 8.16144 30.3636 14.31C31.6043 8.16144 33.9891 4 36.7273 4C40.7439 4 44 12.9543 44 24C44 35.0457 40.7439 44 36.7273 44Z"></path>
                </svg>
              </div>
              <h1 className="text-xl font-bold tracking-tight text-primary dark:text-slate-100">MotorMatch</h1>
            </div>
            <div className="flex items-center gap-3">
              {user && (
                <>
                  <span className="hidden md:block text-sm text-slate-600 dark:text-slate-400">
                    Hola, <span className="font-semibold text-primary dark:text-accent">{user.name}</span>
                  </span>
                  <button
                    onClick={handleLogout}
                    className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-primary dark:text-slate-300 dark:hover:text-accent transition-colors"
                  >
                    Cerrar sesión
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex items-center gap-2 p-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <span className="material-symbols-outlined text-slate-400 ml-2 text-xl">search</span>
            <input
              className="flex-1 bg-transparent border-none focus:ring-0 text-slate-900 dark:text-slate-100 text-sm placeholder:text-slate-400"
              placeholder="Buscar motos por marca, modelo o características..."
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => { setSearchTerm(''); setCommittedSearch(''); }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                aria-label="Limpiar búsqueda"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            )}
            <button
              type="submit"
              className="bg-accent hover:bg-accent/90 text-white px-4 py-1.5 rounded-md font-bold text-sm transition-colors"
            >
              Buscar
            </button>


            {/* Filter Button */}
            <button
              type="button"
              onClick={() => setIsFilterOpen(true)}
              className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-md font-bold text-sm border transition-colors ${
                activeFilterCount > 0
                  ? 'bg-primary text-white border-primary hover:bg-primary/90'
                  : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-200 border-slate-300 dark:border-slate-600 hover:border-primary hover:text-primary dark:hover:text-accent'
              }`}
              aria-label="Abrir filtros"
            >
              <span className="material-symbols-outlined text-base">tune</span>
              <span className="hidden sm:inline">Filtros</span>
              {activeFilterCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-accent text-white text-[10px] font-black rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </form>
        </div>
      </header>


      <main className="flex-1 pt-[88px]">
        {/* Hero Section */}
        <section className="relative w-full h-[100px] flex items-center justify-center px-4 overflow-hidden bg-primary">
          <div className="absolute inset-0 opacity-30">
            <img
              className="w-full h-full object-cover"
              src="https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=1920&h=300&fit=crop"
              alt="Motorcycle on scenic highway"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/50 to-transparent"></div>
          <div className="relative z-10 max-w-4xl w-full text-center">
            <h2 className="text-lg md:text-2xl font-black text-white leading-tight mb-1">
              MotorMatch: Encuentra tu moto ideal en Colombia
            </h2>
            <p className="text-xs md:text-sm text-slate-200 font-medium">
              Descubre la libertad sobre dos ruedas con la mejor asesoría personalizada.
            </p>
          </div>
        </section>

        {/* Popular Brands */}
        {!loading && brands.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 py-3 mt-3">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold tracking-wider text-primary dark:text-accent uppercase">Marcas Populares</h3>
              <div className="h-px flex-1 bg-primary/10 ml-6"></div>
            </div>
            <div className="grid grid-cols-4 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {brands.map((brand) => (
                <div
                  key={brand}
                  className="flex flex-col items-center gap-2 p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
                >
                  <div className="w-full h-14 flex items-center justify-center p-2">
                    <img
                      src={getBrandLogo(brand)}
                      alt={`Logo ${brand}`}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  <span className="font-semibold text-xs text-center text-slate-600 dark:text-slate-400">{brand}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Main CTAs */}
        <section className="max-w-7xl mx-auto px-4 py-3 grid grid-cols-1 md:grid-cols-2 gap-3">
          <button onClick={() => navigate('/questionnaire')} className="w-full py-2 bg-primary hover:bg-primary/95 text-white rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all transform hover:-translate-y-1 shadow-lg">
            <span className="material-symbols-outlined text-base">quiz</span>
            COMENZAR CUESTIONARIO
          </button>
          <button className="w-full py-2 bg-white dark:bg-slate-800 border-2 border-primary text-primary dark:text-slate-100 dark:border-slate-700 hover:bg-primary/5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all transform hover:-translate-y-1 shadow-sm">
            <span className="material-symbols-outlined text-base">explore</span>
            VER CATÁLOGO
          </button>
        </section>

        {/* Catalog Section */}
        <section className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4 mb-3">
            <div className="flex flex-col gap-0.5">
              <h3 className="text-xl font-bold text-primary dark:text-slate-100">CATÁLOGO DE MOTOS</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {activeFilterCount > 0 || committedSearch
                  ? <>{motorcycles.length} <span className="text-[#f97316]">resultado{motorcycles.length !== 1 ? 's' : ''}</span>{committedSearch ? <> para <em>"{committedSearch}"</em></> : ' con filtros activos'}</>
                  : <>{motorcycles.length} motocicletas disponibles</>
                }
              </p>
            </div>
            {loading && activeFilterCount > 0 && (
              <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
                <svg className="animate-spin w-4 h-4 text-[#f97316]" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                Filtrando...
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
              <span className="material-symbols-outlined text-red-500 text-5xl mb-4">error</span>
              <p className="text-red-700 dark:text-red-400 font-medium mb-4">{error}</p>
              <button onClick={loadData} className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-bold transition-colors">
                Reintentar
              </button>
            </div>
          )}

          {/* Initial full-page skeleton on first load */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => <MotorcycleSkeleton key={i} />)}
            </div>
          )}

          {/* Results grid — dims while a filter request is in flight */}
          {!loading && !error && motorcycles.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {motorcycles.map((motorcycle) => (
                <MotorcycleCard key={motorcycle.id} motorcycle={motorcycle} />
              ))}
            </div>
          )}

          {/* No results after filtering */}
          {!loading && !error && motorcycles.length === 0 && activeFilterCount > 0 && (
            <div className="text-center py-16">
              <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 text-8xl mb-4">search_off</span>
              <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">Ninguna moto coincide con los filtros</p>
              <button
                onClick={handleResetFilters}
                className="mt-4 px-5 py-2 text-sm font-bold text-[#f97316] border border-[#f97316] rounded-lg hover:bg-orange-50 transition-colors"
              >
                Limpiar filtros
              </button>
            </div>
          )}

          {/* No motorcycles at all in the DB */}
          {!loading && !error && motorcycles.length === 0 && (
            <div className="text-center py-16">
              <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 text-8xl mb-4">two_wheeler</span>
              <p className="text-slate-500 dark:text-slate-400 text-xl">No hay motocicletas disponibles</p>
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-background-dark border-t border-primary/10 py-12 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="flex items-center gap-2 text-primary dark:text-accent opacity-80">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 48 48">
                <path d="M36.7273 44C33.9891 44 31.6043 39.8386 30.3636 33.69C29.123 39.8386 26.7382 44 24 44C21.2618 44 18.877 39.8386 17.6364 33.69C16.3957 39.8386 14.0109 44 11.2727 44C7.25611 44 4 35.0457 4 24C4 12.9543 7.25611 4 11.2727 4C14.0109 4 16.3957 8.16144 17.6364 14.31C18.877 8.16144 21.2618 4 24 4C26.7382 4 29.123 8.16144 30.3636 14.31C31.6043 8.16144 33.9891 4 36.7273 4C40.7439 4 44 12.9543 44 24C44 35.0457 40.7439 44 36.7273 44Z"></path>
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