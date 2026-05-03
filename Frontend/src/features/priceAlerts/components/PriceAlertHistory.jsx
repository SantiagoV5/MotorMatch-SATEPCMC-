import { useState, useEffect } from 'react';
import { priceAlertsService } from '../services/priceAlerts.service';
import { formatCurrency } from '../../../shared/utils/formatters';

export default function PriceAlertHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchHistory(page);
  }, [page]);

  const fetchHistory = async (pageNumber) => {
    setLoading(true);
    try {
      const { data, meta } = await priceAlertsService.getHistory(pageNumber, 10);
      setHistory(data || []);
      setTotalPages(meta?.totalPages || 1);
      setError('');
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Error al cargar el historial');
    } finally {
      setLoading(false);
    }
  };

  if (loading && history.length === 0) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse bg-slate-50 h-16 rounded-xl w-full"></div>
        ))}
      </div>
    );
  }

  if (!loading && history.length === 0) {
    return (
      <div className="text-center py-10 bg-slate-50 border border-slate-100 rounded-2xl">
        <span className="material-symbols-outlined text-4xl text-slate-300 mb-2 block">history</span>
        <h3 className="text-lg font-bold text-slate-600">Aún no hay notificaciones</h3>
        <p className="text-slate-400 text-sm">El historial de alertas aparecerá aquí cuando los precios bajen.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm">{error}</div>}
      
      <div className="space-y-3">
        {history.map(item => (
          <div key={item.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-white border border-slate-100 rounded-xl shadow-sm gap-4">
             <div>
                <span className="text-[10px] font-bold px-2 py-1 bg-green-50 text-green-700 rounded-full mb-2 inline-block shadow-sm">
                  {item.type === 'EMAIL' ? 'Correo Enviado' : item.type}
                </span>
                <p className="text-sm font-semibold text-slate-700">
                  La moto con alerta bajó a <strong className="text-green-600">{formatCurrency(item.newPrice)}</strong>
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Enviado el {new Date(item.sentAt).toLocaleString()}
                </p>
             </div>
             
             {item.motorcycle && (
               <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-lg pr-4">
                 {item.motorcycle.imageUrl ? (
                    <img src={item.motorcycle.imageUrl} alt="Moto" className="w-10 h-10 object-cover rounded-md" />
                 ) : (
                    <div className="w-10 h-10 bg-slate-200 rounded-md flex items-center justify-center"><span className="material-symbols-outlined text-sm text-slate-400">two_wheeler</span></div>
                 )}
                 <div>
                   <p className="text-xs font-bold text-[#0A2463]">{item.motorcycle.brand}</p>
                   <p className="text-xs text-slate-500">{item.motorcycle.model}</p>
                 </div>
               </div>
             )}
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button 
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 text-sm font-medium"
          >
            Anterior
          </button>
          <span className="text-xs font-semibold text-slate-700">
            {page} / {totalPages}
          </span>
          <button 
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 text-sm font-medium"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}