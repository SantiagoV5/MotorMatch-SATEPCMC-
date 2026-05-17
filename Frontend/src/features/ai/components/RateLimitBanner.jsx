/**
 * RateLimitBanner.jsx
 * Banner específico para el error 429 de Gemini.
 * Muestra un countdown del tiempo de espera y se cierra automáticamente.
 */

import { useEffect, useState } from 'react';

export default function RateLimitBanner({ retryAfter, onDismiss }) {
  const [seconds, setSeconds] = useState(retryAfter ?? 60);

  useEffect(() => {
    if (seconds <= 0) {
      onDismiss?.();
      return;
    }
    const id = setInterval(() => setSeconds((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [seconds, onDismiss]);

  return (
    <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 mb-4 text-sm">
      <span
        className="material-symbols-outlined flex-shrink-0 mt-0.5 text-amber-500"
        style={{ fontSize: '18px' }}
      >
        hourglass_top
      </span>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-amber-800">Límite de consultas alcanzado</p>
        <p className="text-amber-700 mt-0.5">
          La IA está siendo muy solicitada. Podrás enviar otro mensaje en{' '}
          <span className="font-bold tabular-nums">{seconds}s</span>.
        </p>
        <p className="text-amber-600 text-xs mt-1">
          Tip: si esto ocurre frecuentemente, considera obtener una API key propia en{' '}
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-amber-800"
          >
            Google AI Studio
          </a>
          .
        </p>
      </div>
      <button
        onClick={onDismiss}
        className="flex-shrink-0 text-amber-400 hover:text-amber-600 transition-colors"
        title="Cerrar"
      >
        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
      </button>
    </div>
  );
}
