import { useState, useEffect } from 'react';
import { getAllMotorcycles, getBrands } from '../../motorcycles/services/motorcycleService';

// ── Constantes de precio ────────────────────────────────────────────────────
export const MIN_PRICE = 5000000;
export const MAX_PRICE = 50000000;

// ── Mapeo de opciones de cilindraje a parámetros del backend ────────────────
export const DISPLACEMENT_CC = {
  low:     { minCc: 50,  maxCc: 200  },
  mid:     { minCc: 201, maxCc: 400  },
  high:    { minCc: 401, maxCc: 600  },
  premium: { minCc: 601, maxCc: null },
};

export const DISPLACEMENT_OPTIONS = [
  { label: 'Bajo (50cc - 200cc)',   subtitle: 'Ideal para principiantes', value: 'low'     },
  { label: 'Medio (201cc - 400cc)', subtitle: 'Para uso mixto',           value: 'mid'     },
  { label: 'Alto (401cc - 600cc)',  subtitle: 'Experiencia intermedia',   value: 'high'    },
  { label: 'Premium (601cc+)',      subtitle: 'Alta cilindrada',          value: 'premium' },
];

// ── Hook principal ───────────────────────────────────────────────────────────
export function useFilters() {
  // Estados de filtros
  const [priceRange, setPriceRange]                     = useState([MIN_PRICE, MAX_PRICE]);
  const [selectedBrands, setSelectedBrands]             = useState([]);
  const [selectedDisplacement, setSelectedDisplacement] = useState('');
  const [searchTerm, setSearchTerm]                     = useState('');

  // Precio con debounce para no disparar peticiones mientras se arrastra el slider
  const [debouncedPrice, setDebouncedPrice] = useState([MIN_PRICE, MAX_PRICE]);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedPrice(priceRange), 150);
    return () => clearTimeout(t);
  }, [priceRange]);

  // Búsqueda con debounce — espera 350ms tras el último tecleo antes de consultar
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm), 350);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // Resultados y estado de carga
  const [motorcycles, setMotorcycles] = useState([]);
  const [brands, setBrands]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);

  // Carga de marcas una sola vez al montar
  useEffect(() => {
    getBrands()
      .then(data => setBrands(data || []))
      .catch(err => console.error('Error cargando marcas:', err));
  }, []);

  // Re-consulta al backend cada vez que cambia algún filtro o la búsqueda
  useEffect(() => {
    fetchMotorcycles();
  }, [debouncedPrice, selectedBrands, selectedDisplacement, debouncedSearch]);

  const fetchMotorcycles = async () => {
    try {
      setLoading(true);
      setError(null);

      const filters = {};

      // Precio — solo envía si el usuario movió el slider
      if (debouncedPrice[0] !== MIN_PRICE) filters.minPrice = debouncedPrice[0];
      if (debouncedPrice[1] !== MAX_PRICE) filters.maxPrice = debouncedPrice[1];

      // Cilindraje
      if (selectedDisplacement && DISPLACEMENT_CC[selectedDisplacement]) {
        const { minCc, maxCc } = DISPLACEMENT_CC[selectedDisplacement];
        if (minCc !== null) filters.minCc = minCc;
        if (maxCc !== null) filters.maxCc = maxCc;
      }

      // Búsqueda por texto
      if (debouncedSearch.trim()) filters.search = debouncedSearch.trim();

      // Marca — el backend acepta una marca por llamada;
      // para múltiples marcas se hacen peticiones en paralelo y se fusionan.
      if (selectedBrands.length === 1) {
        filters.brand = selectedBrands[0];
        const data = await getAllMotorcycles(filters);
        setMotorcycles(data || []);
      } else if (selectedBrands.length > 1) {
        const results = await Promise.all(
          selectedBrands.map(brand => getAllMotorcycles({ ...filters, brand }))
        );
        const merged = Object.values(
          results.flat().reduce((acc, moto) => { acc[moto.id] = moto; return acc; }, {})
        );
        setMotorcycles(merged);
      } else {
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

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleBrandToggle = (brand) => {
    setSelectedBrands(prev =>
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
  };

  const handleDisplacementSelect = (value) => {
    setSelectedDisplacement(prev => prev === value ? '' : value);
  };

  const handleResetFilters = () => {
    setPriceRange([MIN_PRICE, MAX_PRICE]);
    setSelectedBrands([]);
    setSelectedDisplacement('');
    setSearchTerm('');
  };

  // Número de filtros activos (para el badge del botón — la búsqueda no cuenta como filtro de sidebar)
  const activeFilterCount =
    selectedBrands.length +
    (selectedDisplacement ? 1 : 0) +
    (priceRange[0] !== MIN_PRICE || priceRange[1] !== MAX_PRICE ? 1 : 0);

  // Conteo de motos por marca (para los badges del sidebar)
  const countByBrand = motorcycles.reduce((acc, moto) => {
    const brand = (moto.brand || '').toUpperCase();
    acc[brand] = (acc[brand] || 0) + 1;
    return acc;
  }, {});

  return {
    // Estado
    motorcycles,
    brands,
    loading,
    error,
    // Filtros de sidebar
    priceRange,
    setPriceRange,
    selectedBrands,
    selectedDisplacement,
    activeFilterCount,
    countByBrand,
    // Búsqueda
    searchTerm,
    setSearchTerm,
    // Handlers
    handleBrandToggle,
    handleDisplacementSelect,
    handleResetFilters,
    retry: fetchMotorcycles,
  };
}
