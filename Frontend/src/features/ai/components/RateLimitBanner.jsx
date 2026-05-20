/**
 * RateLimitBanner.jsx
 * Banner que muestra un contador regresivo cuando se alcanza el límite de la API (429).
 */

import { useEffect, useState } from 'react';

export default function RateLimitBanner({ retryAfter = 60, onDismiss }) {
  const [seconds, setSeconds] = useState(retryAfter);

  useEffect(() => {
    setSeconds(retryAfter);
    const interval = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          clearInterval(interval);
          onDismiss?.();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [retryAfter, onDismiss]);

  return (
    <div className="mb-4 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800">
      <span
        className="material-symbols-outlined flex-shrink-0 mt-0.5 text-amber-500"
        style={{ fontSize: '20px' }}
      >
        timer
      </span>
      <div className="flex-1 text-sm">
        <p className="font-semibold">Límite de solicitudes alcanzado</p>
        <p className="text-amber-700">
          El asistente estará disponible en{' '}
          <span className="font-bold tabular-nums">{seconds}s</span>.
        </p>
      </div>
      <button
        onClick={onDismiss}
        className="text-amber-400 hover:text-amber-700 transition-colors"
        title="Cerrar"
      >
        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
      </button>
    </div>
  );
}
