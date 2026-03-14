import { useRef, useCallback } from 'react';
import { MIN_PRICE, MAX_PRICE } from '../hooks/useFilters';

/**
 * Slider de rango de precio con dos thumbs arrastrables.
 *
 * Props:
 *  - priceRange    [min, max]  valores actuales
 *  - setPriceRange función para actualizar el rango
 */
export default function PriceFilter({ priceRange, setPriceRange }) {
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

  return (
    <div className="mb-8">
      <p className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-6">
        Rango de Precio
      </p>
      <div className="px-2">
        {/* Track */}
        <div
          ref={trackRef}
          className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full relative select-none"
        >
          {/* Relleno activo entre los dos thumbs */}
          <div
            className="absolute h-full rounded-full"
            style={{ left: `${minPct}%`, width: `${maxPct - minPct}%`, backgroundColor: '#f97316' }}
          />

          {/* Thumb mínimo */}
          <div
            className="absolute -top-[5px] w-4 h-4 bg-white border-2 rounded-full cursor-grab active:cursor-grabbing shadow-sm transition-transform hover:scale-110"
            style={{ left: `${minPct}%`, transform: 'translateX(-50%)', borderColor: '#f97316', zIndex: 2 }}
            onMouseDown={startDrag('min')}
            onTouchStart={startDrag('min')}
          />

          {/* Thumb máximo */}
          <div
            className="absolute -top-[5px] w-4 h-4 bg-white border-2 rounded-full cursor-grab active:cursor-grabbing shadow-sm transition-transform hover:scale-110"
            style={{ left: `${maxPct}%`, transform: 'translateX(-50%)', borderColor: '#f97316', zIndex: 2 }}
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
  );
}
