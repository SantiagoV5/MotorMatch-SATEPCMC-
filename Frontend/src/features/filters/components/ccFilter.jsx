import { DISPLACEMENT_OPTIONS } from '../hooks/useFilters';

/**
 * Filtro de cilindraje con radio buttons personalizados.
 * Permite deseleccionar la opción activa haciendo clic de nuevo.
 *
 * Props:
 *  - selectedDisplacement  string  valor actualmente seleccionado ('low' | 'mid' | 'high' | 'premium' | '')
 *  - onSelect              función que recibe el value de la opción clickeada
 */
export default function CcFilter({ selectedDisplacement, onSelect }) {
  return (
    <div>
      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-3">
        Cilindraje
      </h3>
      <div className="space-y-1">
        {DISPLACEMENT_OPTIONS.map((option) => {
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
              {/* Radio personalizado naranja */}
              <div
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors mt-0.5 ${
                  isSelected
                    ? 'border-[#f97316]'
                    : 'border-slate-300 dark:border-slate-600'
                }`}
                onClick={() => onSelect(option.value)}
              >
                {isSelected && <div className="w-2 h-2 rounded-full bg-[#f97316]" />}
              </div>

              {/* Etiqueta + subtítulo */}
              <div className="flex flex-col" onClick={() => onSelect(option.value)}>
                <span className={`text-sm font-medium transition-colors ${
                  isSelected ? 'text-[#f97316]' : 'text-slate-700 dark:text-slate-300'
                }`}>
                  {option.label}
                </span>
                <span className="text-xs text-slate-400 dark:text-slate-500">
                  {option.subtitle}
                </span>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}
