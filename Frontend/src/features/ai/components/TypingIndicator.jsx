/**
 * TypingIndicator.jsx
 * Indicador animado de "la IA está escribiendo..."
 */

export default function TypingIndicator() {
  return (
    <div className="flex justify-start mb-4">
      {/* Avatar IA */}
      <div className="flex-shrink-0 mr-3 mt-1">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center shadow-sm"
          style={{ background: 'linear-gradient(135deg, #0A2463 0%, #1A3A6B 100%)' }}
        >
          <span
            className="material-symbols-outlined text-white"
            style={{ fontSize: '16px', fontVariationSettings: "'FILL' 1" }}
          >
            smart_toy
          </span>
        </div>
      </div>

      {/* Puntos animados */}
      <div className="bg-white border border-slate-100 shadow-sm px-5 py-4 rounded-2xl rounded-tl-sm flex items-center gap-1.5">
        <span
          className="w-2 h-2 rounded-full bg-slate-300 animate-bounce"
          style={{ animationDelay: '0ms' }}
        />
        <span
          className="w-2 h-2 rounded-full bg-slate-300 animate-bounce"
          style={{ animationDelay: '160ms' }}
        />
        <span
          className="w-2 h-2 rounded-full bg-slate-300 animate-bounce"
          style={{ animationDelay: '320ms' }}
        />
      </div>
    </div>
  );
}
