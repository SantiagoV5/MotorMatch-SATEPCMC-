import { useState, useEffect } from 'react';
import { priceAlertsService } from '../services/priceAlerts.service';
import PriceAlertCard from './PriceAlertCard';
import PriceAlertHistory from './PriceAlertHistory';

export default function PriceAlertList() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [view, setView] = useState('LIST'); // 'LIST' | 'HISTORY'
  
  // Paginación
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchAlerts(page);
  }, [page]);

  const fetchAlerts = async (pageNumber) => {
    setLoading(true);
    try {
      const { data, meta } = await priceAlertsService.getAlerts(pageNumber, 10);
      setAlerts(data || []);
      setTotalPages(meta?.totalPages || 1);
      setError('');
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Error al cargar las alertas');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message) => {
    setSuccessMsg(message);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handlePause = async (id) => {
    try {
      // Optimistic update
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'PAUSED' } : a));
      await priceAlertsService.pauseAlert(id);
      showToast('Alerta pausada exitosamente.');
    } catch (err) {
      // Revert
      fetchAlerts(page);
      setError('No se pudo pausar la alerta.');
    }
  };

  const handleReactivate = async (id) => {
    try {
      // Optimistic update
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'ACTIVE' } : a));
      await priceAlertsService.reactivateAlert(id);
      showToast('Alerta reactivada exitosamente.');
    } catch (err) {
      // Revert
      fetchAlerts(page);
      setError('No se pudo reactivar la alerta.');
    }
  };

  const handleDelete = async (id) => {
    try {
      // Optimistic update
      setAlerts(prev => prev.filter(a => a.id !== id));
      await priceAlertsService.deleteAlert(id);
      showToast('Alerta eliminada permanentemente.');
      // If we delete the last item on a page, fetch again
      if (alerts.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        fetchAlerts(page); // Reload to fix pagination metrics
      }
    } catch (err) {
      fetchAlerts(page);
      setError('No se pudo eliminar la alerta.');
    }
  };

  const renderListContent = () => {
    if (loading && alerts.length === 0) {
      return (
        <div className="space-y-4">
          {[1, 2].map(i => (
            <div key={i} className="animate-pulse bg-slate-100 h-32 rounded-2xl w-full"></div>
          ))}
        </div>
      );
    }

    if (!loading && alerts.length === 0) {
      return (
        <div className="text-center py-16 bg-white border border-slate-100 rounded-3xl shadow-sm">
          <span className="material-symbols-outlined text-6xl text-slate-300 mb-4 block">notifications_off</span>
          <h3 className="text-xl font-bold text-[#0A2463] mb-2">No tienes alertas activas</h3>
          <p className="text-slate-500 max-w-md mx-auto mb-6">
            Configura alertas de precio desde el catálogo para que te avisemos cuando la moto de tus sueños baje de precio.
          </p>
          <a href="/catalog" className="inline-flex items-center gap-2 bg-[#FF6B35] text-white px-6 py-3 rounded-xl font-bold hover:brightness-110 transition-all">
            <span className="material-symbols-outlined">two_wheeler</span>
            Explorar Motos
          </a>
        </div>
      );
    }

    return (
      <>
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-4">
          {alerts.map(alert => (
            <PriceAlertCard 
              key={alert.id} 
              alert={alert} 
              onPause={handlePause}
              onReactivate={handleReactivate}
              onDelete={handleDelete}
            />
          ))}
        </div>

        {/* Paginación UI (Si hay más de 1 página) */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <span className="text-sm font-semibold text-slate-700 px-4">
              Página {page} de {totalPages}
            </span>
            <button 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toast Notification */}
      {successMsg && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 border border-slate-800 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-fade-in">
          <span className="material-symbols-outlined text-green-400">check_circle</span>
          <span className="font-medium text-sm">{successMsg}</span>
        </div>
      )}

      {/* Tabs Mis Alertas vs Historial */}
      <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl w-fit mb-6">
        <button 
          onClick={() => setView('LIST')}
          className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${view === 'LIST' ? 'bg-white text-[#0A2463] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Mis Alertas
        </button>
        <button 
          onClick={() => setView('HISTORY')}
          className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${view === 'HISTORY' ? 'bg-white text-[#FF6B35] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Historial de Avisos
        </button>
      </div>

      {view === 'HISTORY' ? (
        <PriceAlertHistory />
      ) : (
        renderListContent()
      )}
    </div>
  );
}