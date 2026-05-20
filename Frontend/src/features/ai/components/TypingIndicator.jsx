/**
 * TypingIndicator.jsx
 * Indicador animado de "la IA está escribiendo…"
 */

export default function TypingIndicator() {
  return (
    <div className="mb-4 flex gap-3">
      {/* Avatar IA */}
      <div
        className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl shadow-sm"
        style={{ background: 'linear-gradient(135deg, #FF6B35 0%, #e55a25 100%)' }}
      >
        <span
          className="material-symbols-outlined text-white"
          style={{ fontSize: '16px', fontVariationSettings: "'FILL' 1" }}
        >
          smart_toy
        </span>
      </div>

      {/* Burbuja con puntos */}
      <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm bg-white px-4 py-3 shadow-sm border border-slate-100">
        <span className="h-2 w-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="h-2 w-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="h-2 w-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
}
