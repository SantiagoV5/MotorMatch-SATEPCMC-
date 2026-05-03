import { useState, useEffect } from 'react';
import { priceAlertsService } from '../services/priceAlerts.service';
import { useNavigate } from 'react-router-dom';

export function PriceAlertModal({ isOpen, onClose, motorcycle }) {
  const navigate = useNavigate();
  const [targetPrice, setTargetPrice] = useState('');
  const [notificationType, setNotificationType] = useState('BOTH');
  const [status, setStatus] = useState({ state: 'idle', message: '' }); // idle | loading | success | error

  // Reset y sugerir precio (5% menos del actual) cuando se abre el modal
  useEffect(() => {
    if (isOpen && motorcycle?.price) {
      const currentPrice = parseFloat(motorcycle.price);
      const suggestedPrice = currentPrice - (currentPrice * 0.05);
      setTargetPrice(suggestedPrice.toFixed(0)); // Sin decimales para formato COP
      setStatus({ state: 'idle', message: '' });
      setNotificationType('BOTH');
    }
  }, [isOpen, motorcycle]);

  if (!isOpen || !motorcycle) return null;

  const currentPriceFormatted = parseFloat(motorcycle.price).toLocaleString('es-CO');
  
  const validateForm = () => {
    const numPrice = parseFloat(targetPrice);
    if (!targetPrice || isNaN(numPrice)) {
      setStatus({ state: 'error', message: 'Por favor ingresa un precio válido.' });
      return false;
    }
    if (numPrice <= 0) {
      setStatus({ state: 'error', message: 'El precio debe ser mayor a $0.' });
      return false;
    }
    if (numPrice >= parseFloat(motorcycle.price)) {
      setStatus({ state: 'error', message: 'El precio objetivo debería ser menor al precio actual.' });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Validar sesión antes de enviar (si no hay token, enviar a login)
    const token = sessionStorage.getItem('mm_token') || localStorage.getItem('mm_token');
    if (!token) {
      setStatus({ state: 'error', message: 'Debes iniciar sesión primero.' });
      setTimeout(() => {
        onClose();
        navigate('/login'); // Ajustar según ruta real de login
      }, 2000);
      return;
    }

    setStatus({ state: 'loading', message: '' });

    try {
      await priceAlertsService.createAlert({
        motorcycleId: parseInt(motorcycle.id),
        targetPrice: parseFloat(targetPrice),
        notificationType
      });

      setStatus({ state: 'success', message: '¡Alerta creada exitosamente! Te avisaremos cuando baje de precio.' });
      
      // Auto-cerrar tras éxito
      setTimeout(() => {
        onClose();
      }, 2500);

    } catch (err) {
      let errorMsg = 'Error al crear la alerta. Inténtalo más tarde.';
      const backendMessage =
        (typeof err === 'string' && err) ||
        err?.message ||
        err?.error ||
        (Array.isArray(err?.details) ? err.details.join(' ') : '');
      
      // Manejo específico de errores
      if (backendMessage.includes('token') || backendMessage.includes('autorizado')) {
        errorMsg = 'Sesión expirada. Por favor, inicia sesión de nuevo.';
        setTimeout(() => { onClose(); navigate('/login'); }, 2000);
      } else if (backendMessage.includes('10 alertas')) {
        errorMsg = 'Límite alcanzado: Tienes 10 alertas activas. Gestiona tus alertas en tu Perfil.';
      } else if (backendMessage.includes('Ya tienes una alerta')) {
        errorMsg = 'Ya tienes una alerta activa para esta moto.';
      } else if (backendMessage) {
        errorMsg = backendMessage;
      }

      setStatus({ state: 'error', message: errorMsg });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 transition-opacity">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in-up">
        
        {/* Header Modal */}
        <div className="bg-[#0A2463] p-6 text-white text-center relative relative">
          <button 
            onClick={onClose}
            disabled={status.state === 'loading'}
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
          <span className="material-symbols-outlined text-4xl mb-2 text-[#FF6B35]">notifications_active</span>
          <h2 className="text-xl font-bold tracking-wide">ALERTA DE PRECIO</h2>
          <p className="text-sm text-slate-300 mt-1">Te avisaremos cuando baje el costo</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          
          {/* Info de la moto */}
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 mb-6 flex items-center gap-4">
            {motorcycle.imageUrl && (
              <img src={motorcycle.imageUrl} alt={motorcycle.model} className="w-16 h-16 object-cover rounded-lg border border-slate-200" />
            )}
            <div>
              <p className="text-xs font-bold text-[#FF6B35] uppercase">{motorcycle.brand}</p>
              <h3 className="text-base font-bold text-[#0A2463]">{motorcycle.model}</h3>
              <p className="text-sm text-slate-500">Actual: <strong className="text-slate-800">${currentPriceFormatted}</strong></p>
            </div>
          </div>

          {/* Formulario */}
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 flex justify-between">
                Precio Objetivo
                <span className="text-[#FF6B35] text-xs font-normal bg-[#FF6B35]/10 px-2 py-0.5 rounded">Sugerimos -5%</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</span>
                <input 
                  type="number" 
                  value={targetPrice}
                  onChange={(e) => {
                    setTargetPrice(e.target.value);
                    if (status.state === 'error') setStatus({ state: 'idle', message: '' });
                  }}
                  className="w-full pl-8 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl outline-none focus:border-[#0A2463] focus:bg-white text-slate-800 font-medium transition-all"
                  placeholder="Ej: 20000000"
                  disabled={status.state === 'loading' || status.state === 'success'}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-3">¿Cómo te avisamos?</label>
              <div className="grid grid-cols-3 gap-3">
                <label className={`cursor-pointer border-2 rounded-xl p-3 text-center transition-all ${notificationType === 'EMAIL' ? 'border-[#0A2463] bg-[#0A2463]/5' : 'border-slate-200 hover:border-slate-300'}`}>
                  <input type="radio" value="EMAIL" checked={notificationType === 'EMAIL'} onChange={(e) => setNotificationType(e.target.value)} className="hidden" disabled={status.state === 'loading' || status.state === 'success'} />
                  <span className={`material-symbols-outlined text-2xl ${notificationType === 'EMAIL' ? 'text-[#0A2463]' : 'text-slate-400'}`}>mail</span>
                  <p className={`text-xs font-bold mt-1 ${notificationType === 'EMAIL' ? 'text-[#0A2463]' : 'text-slate-500'}`}>Email</p>
                </label>
                
                <label className={`cursor-pointer border-2 rounded-xl p-3 text-center transition-all ${notificationType === 'IN_APP' ? 'border-[#0A2463] bg-[#0A2463]/5' : 'border-slate-200 hover:border-slate-300'}`}>
                  <input type="radio" value="IN_APP" checked={notificationType === 'IN_APP'} onChange={(e) => setNotificationType(e.target.value)} className="hidden" disabled={status.state === 'loading' || status.state === 'success'} />
                  <span className={`material-symbols-outlined text-2xl ${notificationType === 'IN_APP' ? 'text-[#0A2463]' : 'text-slate-400'}`}>phone_iphone</span>
                  <p className={`text-xs font-bold mt-1 ${notificationType === 'IN_APP' ? 'text-[#0A2463]' : 'text-slate-500'}`}>App</p>
                </label>

                <label className={`cursor-pointer border-2 rounded-xl p-3 text-center transition-all ${notificationType === 'BOTH' ? 'border-[#0A2463] bg-[#0A2463]/5' : 'border-slate-200 hover:border-slate-300'}`}>
                  <input type="radio" value="BOTH" checked={notificationType === 'BOTH'} onChange={(e) => setNotificationType(e.target.value)} className="hidden" disabled={status.state === 'loading' || status.state === 'success'} />
                  <span className={`material-symbols-outlined text-2xl ${notificationType === 'BOTH' ? 'text-[#0A2463]' : 'text-slate-400'}`}>mark_email_unread</span>
                  <p className={`text-xs font-bold mt-1 ${notificationType === 'BOTH' ? 'text-[#0A2463]' : 'text-slate-500'}`}>Ambas</p>
                </label>
              </div>
            </div>
          </div>

          {/* Menasajes de Error o Éxito */}
          {status.state === 'error' && (
            <div className="mt-6 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <span className="material-symbols-outlined text-red-500 shrink-0 text-xl">error</span>
              <p className="text-sm text-red-700">{status.message}</p>
            </div>
          )}

          {status.state === 'success' && (
            <div className="mt-6 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
              <span className="material-symbols-outlined text-green-500 shrink-0 text-xl">check_circle</span>
              <p className="text-sm text-green-700 font-medium">{status.message}</p>
            </div>
          )}

          {/* Actions */}
          <div className="mt-8 flex gap-3">
            <button 
              type="button" 
              onClick={onClose}
              disabled={status.state === 'loading' || status.state === 'success'}
              className="flex-1 px-4 py-3 border-2 border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              disabled={status.state === 'loading' || status.state === 'success'}
              className="flex-1 px-4 py-3 bg-[#FF6B35] text-white font-bold rounded-xl hover:brightness-110 flex justify-center items-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-[#FF6B35]/20"
            >
              {status.state === 'loading' ? (
                <span className="material-symbols-outlined animate-spin">progress_activity</span>
              ) : (
                <>
                  <span className="material-symbols-outlined text-lg">notifications_active</span>
                  CREAR ALERTA
                </>
              )}
            </button>
          </div>
        </form>
      </div>
      {/* Animación global CSS inline para que no dependa de config */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fade-in-up { animation: fadeInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </div>
  );
}
