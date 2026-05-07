import { useState, useEffect } from 'react';
import * as ics from 'ics';
import { getMyProfile, updateMyMileage } from '../../profile/services/profileService';

function MaintenanceEstimator({ motorcycle }) {
  const [monthlyKm, setMonthlyKm] = useState(500);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Intentar cargar el kilometraje guardado del usuario si está logueado
  useEffect(() => {
    const fetchUserData = async () => {
      const userStr = sessionStorage.getItem('mm_user');
      if (userStr) {
        setIsLoggedIn(true);
        try {
          const profile = await getMyProfile();
          if (profile && profile.monthlyMileage) {
            setMonthlyKm(profile.monthlyMileage);
          }
        } catch (error) {
          console.error("Error al obtener el kilometraje del usuario:", error);
        }
      }
    };
    fetchUserData();
  }, []);

  const handleSaveMileage = async () => {
    if (!isLoggedIn) return;
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await updateMyMileage(monthlyKm);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Error guardando el kilometraje:", err);
    } finally {
      setIsSaving(false);
    }
  };

  // ─── Variables de Costo (Aprox) ────────────────────────────────────────
  const OIL_CHANGE_INTERVAL = 3000;
  const OIL_CHANGE_COST = 150000;

  const GENERAL_CHECK_INTERVAL = 6000;
  const GENERAL_CHECK_COST = 200000;

  const TIRE_CHANGE_INTERVAL = 15000;
  let TIRE_CHANGE_COST = 250000; // Default para menos de 160cc
  const cc = motorcycle?.engineCc || 0;
  if (cc >= 160 && cc <= 400) {
    TIRE_CHANGE_COST = 450000;
  } else if (cc > 400) {
    TIRE_CHANGE_COST = 800000;
  }

  // ─── Cálculos Anuales ──────────────────────────────────────────────────
  const annualKm = monthlyKm * 12;
  
  const annualOilChanges = annualKm / OIL_CHANGE_INTERVAL;
  const annualOilCost = annualOilChanges * OIL_CHANGE_COST;

  const annualGeneralChecks = annualKm / GENERAL_CHECK_INTERVAL;
  const annualGeneralCheckCost = annualGeneralChecks * GENERAL_CHECK_COST;

  const annualTireChanges = annualKm / TIRE_CHANGE_INTERVAL;
  const annualTireCost = annualTireChanges * TIRE_CHANGE_COST;

  const totalAnnualCost = annualOilCost + annualGeneralCheckCost + annualTireCost;
  const totalMonthlyCost = totalAnnualCost / 12;

  // Formateador
  const formatCOP = (val) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val);

  // ─── Recordatorios de Calendario (.ics) ────────────────────────────────
  const handleDownloadCalendar = () => {
    // Calculamos cuantos meses faltan para que cada evento ocurra por primera vez
    const monthsForOil = OIL_CHANGE_INTERVAL / (monthlyKm || 1);
    const monthsForCheck = GENERAL_CHECK_INTERVAL / (monthlyKm || 1);
    const monthsForTires = TIRE_CHANGE_INTERVAL / (monthlyKm || 1);

    const addMonths = (months) => {
      const d = new Date();
      d.setMonth(d.getMonth() + months);
      return [d.getFullYear(), d.getMonth() + 1, d.getDate(), 9, 0]; // 9:00 AM
    };

    const events = [
      {
        title: `Cambio de Aceite - ${motorcycle.brand} ${motorcycle.model}`,
        description: `Han pasado aprox 3,000km. Es hora del cambio de aceite. Costo estimado: ${formatCOP(OIL_CHANGE_COST)}`,
        start: addMonths(monthsForOil),
        duration: { hours: 2 },
      },
      {
        title: `Revisión General - ${motorcycle.brand} ${motorcycle.model}`,
        description: `Han pasado aprox 6,000km. Toca revisión periódica. Costo estimado: ${formatCOP(GENERAL_CHECK_COST)}`,
        start: addMonths(monthsForCheck),
        duration: { hours: 4 },
      },
      {
        title: `Cambio de Llantas - ${motorcycle.brand} ${motorcycle.model}`,
        description: `Han pasado aprox 15,000km. Chequea el desgaste de llantas. Costo estimado: ${formatCOP(TIRE_CHANGE_COST)}`,
        start: addMonths(monthsForTires),
        duration: { hours: 2 },
      }
    ];

    ics.createEvents(events, (error, value) => {
      if (error) {
        console.error(error);
        return;
      }
      // Trigger download
      const blob = new Blob([value], { type: 'text/calendar;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Mantenimiento_${motorcycle.model.replace(/\s+/g, '')}.ics`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };

  return (
    <section className="mb-20">
      <h3 className="text-2xl font-bold mb-8 border-l-4 border-[#0A2463] pl-4 text-[#0A2463] uppercase tracking-tight">
        Mantenimiento Estimado
      </h3>
      
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Side: Controls */}
        <div className="p-8 md:w-5/12 bg-slate-50 border-r border-slate-200 flex flex-col justify-center">
          <label htmlFor="monthly-mileage" className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">
            Mi kilometraje mensual estimado
          </label>
          <div className="flex items-center gap-3">
            <input 
              id="monthly-mileage"
              type="number" 
              min="0"
              step="50"
              value={monthlyKm} 
              onChange={(e) => setMonthlyKm(Number(e.target.value))}
              className="w-full text-2xl font-black text-[#0A2463] bg-white border-2 border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:border-[#FF6B35] transition-colors"
            />
            <span className="text-slate-500 font-medium">km/mes</span>
          </div>

          {isLoggedIn && (
            <button 
              onClick={handleSaveMileage}
              disabled={isSaving}
              className={`mt-4 py-2 px-4 rounded-lg font-bold text-sm transition-colors border ${
                saveSuccess 
                  ? 'bg-green-50 text-green-700 border-green-200' 
                  : 'bg-white text-slate-600 border-slate-300 hover:border-slate-400 hover:bg-slate-100'
              }`}
            >
              {isSaving ? 'Guardando...' : saveSuccess ? '¡Guardado en el perfil!' : 'Guardar en mi perfil'}
            </button>
          )}

          <div className="mt-8 pt-8 border-t border-slate-200">
            <button 
              onClick={handleDownloadCalendar}
              className="w-full flex items-center justify-center gap-2 bg-[#0A2463] text-white py-3 rounded-xl font-bold hover:brightness-125 transition-all shadow-md"
            >
              <span className="material-symbols-outlined text-[18px]">calendar_month</span>
              Añadir al Calendario
            </button>
            <p className="text-xs text-slate-500 mt-3 text-center">
              Descarga un archivo .ics con recordatorios de mantenimiento sugeridos.
            </p>
          </div>
        </div>

        {/* Right Side: Results */}
        <div className="p-8 md:w-7/12 flex flex-col justify-center bg-white">
          <div className="flex flex-col gap-6">
            
            <div className="flex items-center justify-between pb-4 border-b border-dashed border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-[#FF6B35]">
                  <span className="material-symbols-outlined text-[20px]">oil_barrel</span>
                </div>
                <div>
                  <p className="font-bold text-slate-800">Aceite & Filtro</p>
                  <p className="text-xs text-slate-500">Cada 3,000 km</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-black text-[#0A2463]">{formatCOP(annualOilCost)}</p>
                <p className="text-xs text-slate-400">al año</p>
              </div>
            </div>

            <div className="flex items-center justify-between pb-4 border-b border-dashed border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                  <span className="material-symbols-outlined text-[20px]">handyman</span>
                </div>
                <div>
                  <p className="font-bold text-slate-800">Revisión General</p>
                  <p className="text-xs text-slate-500">Cada 6,000 km</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-black text-[#0A2463]">{formatCOP(annualGeneralCheckCost)}</p>
                <p className="text-xs text-slate-400">al año</p>
              </div>
            </div>

            <div className="flex items-center justify-between pb-4 border-b border-dashed border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                  <span className="material-symbols-outlined text-[20px]">tire_repair</span>
                </div>
                <div>
                  <p className="font-bold text-slate-800">Llantas (Aprox)</p>
                  <p className="text-xs text-slate-500">Cada 15,000 km</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-black text-[#0A2463]">{formatCOP(annualTireCost)}</p>
                <p className="text-xs text-slate-400">al año</p>
              </div>
            </div>

            <div className="mt-4 bg-[#FF6B35]/10 rounded-xl p-5 border border-[#FF6B35]/20 flex items-center justify-between">
              <div>
                <p className="text-[#FF6B35] font-black uppercase tracking-widest text-xs mb-1">Impacto Anual Estimado</p>
                <p className="text-3xl font-black text-[#0A2463]">{formatCOP(totalAnnualCost)}</p>
              </div>
              <div className="text-right">
                <p className="text-[#FF6B35] font-bold text-xs uppercase tracking-widest border-b border-[#FF6B35]/20 pb-1 mb-1">Mensualizado</p>
                <p className="text-lg font-bold text-[#0A2463]">{formatCOP(totalMonthlyCost)}/mes</p>
              </div>
            </div>
            
            <p className="text-[10px] text-slate-400 italic text-center mt-2">
              * Los costos son netamente estimados y pueden variar según el taller, la ciudad y el estilo de conducción del usuario. Utiliza esta proyección solo como un marco de referencia.
            </p>
            
          </div>
        </div>

      </div>
    </section>
  );
}

export default MaintenanceEstimator;
