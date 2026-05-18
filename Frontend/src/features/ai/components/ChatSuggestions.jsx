/**
 * ChatSuggestions.jsx
 * Chips de sugerencia que se muestran cuando el chat está vacío.
 * Al hacer clic, rellenan el campo de texto con la sugerencia.
 */

const SUGGESTIONS = [
  { icon: 'search',          text: '¿Cuál es la moto más económica del catálogo?' },
  { icon: 'compare_arrows',  text: 'Compara una Honda CB 125F con una Bajaj Boxer' },
  { icon: 'local_gas_station', text: '¿Qué motos consumen menos gasolina?' },
  { icon: 'calculate',       text: '¿Cuánto cuesta en total comprar una moto de 200cc?' },
  { icon: 'height',          text: 'Soy alto (1.80 m), ¿qué moto me recomiendas?' },
  { icon: 'trending_up',     text: '¿Cuáles son las motos más guardadas por los usuarios?' },
];

export default function ChatSuggestions({ onSelect }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-xl">
      {SUGGESTIONS.map(({ icon, text }) => (
        <button
          key={text}
          onClick={() => onSelect(text)}
          className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3
                     text-left text-sm text-on-surface-variant shadow-sm
                     hover:border-primary/30 hover:bg-slate-50 hover:text-primary
                     transition-all duration-150 group"
        >
          <span
            className="material-symbols-outlined flex-shrink-0 text-slate-400 group-hover:text-primary transition-colors"
            style={{ fontSize: '18px' }}
          >
            {icon}
          </span>
          <span className="leading-snug">{text}</span>
        </button>
      ))}
    </div>
  );
}
