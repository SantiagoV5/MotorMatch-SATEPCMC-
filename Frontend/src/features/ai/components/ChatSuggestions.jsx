/**
 * ChatSuggestions.jsx
 * Chips de sugerencias rápidas que aparecen en la pantalla de bienvenida
 * o debajo del input cuando el chat está vacío.
 */

const SUGGESTIONS = [
  { icon: 'compare_arrows', text: 'Compara Yamaha MT-03 vs Honda CB300R' },
  { icon: 'attach_money',   text: 'Motos urbanas con presupuesto de $12M' },
  { icon: 'build',          text: '¿Cuánto cuesta mantener una 200cc al año?' },
  { icon: 'route',          text: 'Moto para viajes de larga distancia' },
  { icon: 'school',         text: 'Mejor moto para principiantes en Colombia' },
  { icon: 'local_gas_station', text: '¿Qué moto gasta menos gasolina?' },
];

/**
 * @param {{ onSelect: (text:string)=>void }} props
 */
export default function ChatSuggestions({ onSelect }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl mx-auto">
      {SUGGESTIONS.map((s) => (
        <button
          key={s.text}
          onClick={() => onSelect(s.text)}
          className="flex items-center gap-3 px-4 py-3 bg-white border border-slate-200 rounded-xl
                     text-left text-sm text-on-surface-variant font-medium
                     hover:border-primary/30 hover:text-primary hover:bg-slate-50
                     active:scale-[0.98] transition-all duration-200 shadow-sm group"
        >
          <span
            className="material-symbols-outlined text-slate-400 group-hover:text-accent transition-colors flex-shrink-0"
            style={{ fontSize: '20px' }}
          >
            {s.icon}
          </span>
          <span className="leading-snug">{s.text}</span>
        </button>
      ))}
    </div>
  );
}
