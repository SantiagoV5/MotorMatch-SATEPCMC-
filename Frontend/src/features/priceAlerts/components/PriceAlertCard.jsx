import { useState } from 'react';
import { formatCurrency } from '../../../shared/utils/formatters';

export default function PriceAlertCard({ alert, onPause, onReactivate, onDelete }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPausing, setIsPausing] = useState(false);

  const { id, motorcycle, targetPrice, status, createdAt } = alert;
  
  // Format motorcycle details
  const motorcycleName = motorcycle.brand ? `${motorcycle.brand} ${motorcycle.model}` : 'Moto Eliminada';
  const currentPrice = Number(motorcycle?.price ?? 0);
  
  // Price differences
  const diff = currentPrice - targetPrice;
  const isBelowTarget = currentPrice <= targetPrice;

  const isActive = status === 'ACTIVE';

  const handleToggleStatus = async () => {
    setIsPausing(true);
    try {
      if (isActive) {
        await onPause(id);
      } else {
        await onReactivate(id);
      }
    } finally {
      setIsPausing(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`¿Seguro que deseas eliminar la alerta para ${motorcycleName}?`)) {
      setIsDeleting(true);
      try {
        await onDelete(id);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className={`relative bg-white rounded-2xl border ${isActive ? 'border-slate-200' : 'border-slate-200 opacity-75'} shadow-sm overflow-hidden transition-all hover:shadow-md flex flex-col md:flex-row`}>
      {/* Indicador Visual Decorativo */}
      <div className={`w-full md:w-2 ${isActive ? 'bg-[#FF6B35]' : 'bg-slate-300'} h-2 md:h-auto`}></div>

      {/* Imagen Moto */}
      <div className="w-full md:w-40 h-32 md:h-full bg-slate-100 flex-shrink-0 relative">
         {motorcycle.imageUrl ? (
            <img src={motorcycle.imageUrl} alt={motorcycleName} className="w-full h-full object-cover grayscale-[20%]" />
         ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400">
               <span className="material-symbols-outlined text-4xl">two_wheeler</span>
            </div>
         )}
         {isBelowTarget && isActive && (
           <div className="absolute top-2 right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide animate-pulse shadow-sm">
             ¡META ALCANZADA!
           </div>
         )}
      </div>

      {/* Contenido */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div className="flex justify-between items-start gap-4">
          <div>
            <h3 className="text-lg font-black text-[#0A2463] leading-tight">{motorcycleName}</h3>
            <p className="text-xs text-slate-500 font-medium">Creada el {new Date(createdAt).toLocaleDateString()}</p>
          </div>
          <span className={`px-3 py-1 rounded-full border text-[11px] font-bold uppercase tracking-widest ${isActive ? 'bg-green-50 border-green-200 text-green-700' : 'bg-slate-100 border-slate-200 text-slate-500'}`}>
            {isActive ? 'Activa' : 'Pausada'}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-2 md:flex gap-4 md:gap-8 items-end">
          <div>
            <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Tu Meta</span>
            <span className="text-xl font-black text-slate-800">{formatCurrency(targetPrice)}</span>
          </div>
          <div>
            <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Precio Actual</span>
            <span className={`text-xl font-black ${isBelowTarget ? 'text-green-600' : 'text-slate-500'}`}>
              {formatCurrency(currentPrice)}
            </span>
          </div>
        </div>
      </div>

      {/* Acciones Sidebar */}
      <div className="bg-slate-50 border-l border-slate-100 p-4 flex flex-row md:flex-col justify-center gap-3">
        <button 
          onClick={handleToggleStatus} 
          disabled={isPausing || isDeleting}
          className={`flex items-center justify-center gap-2 p-2 rounded-lg font-semibold text-sm transition-colors ${isActive ? 'text-amber-600 bg-amber-50 hover:bg-amber-100' : 'text-green-600 bg-green-50 hover:bg-green-100'} disabled:opacity-50`}
          title={isActive ? "Pausar Alerta" : "Reactivar Alerta"}
        >
          <span className="material-symbols-outlined text-[20px]">{isActive ? 'pause_circle' : 'play_circle'}</span>
          <span className="md:hidden">{isActive ? 'Pausar' : 'Activar'}</span>
        </button>
        <button 
          onClick={handleDelete}
          disabled={isDeleting || isPausing}
          className="flex items-center justify-center gap-2 p-2 rounded-lg text-red-500 bg-red-50 hover:bg-red-100 font-semibold text-sm transition-colors disabled:opacity-50"
          title="Eliminar Alerta"
        >
          <span className="material-symbols-outlined text-[20px]">delete</span>
          <span className="md:hidden">Eliminar</span>
        </button>
      </div>
    </div>
  );
}