import { useNavigate } from 'react-router-dom';
import { SimulationHistory } from '../features/costSimulator';
import useAuth from '../features/auth/hooks/useAuth';

export function SimulationsHistoryPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Si no está autenticado, redirigir a login
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#F5F7FA]">
        <p className="text-xl text-gray-600">Debes iniciar sesión para ver tus simulaciones</p>
        <button
          onClick={() => navigate('/home')}
          className="px-6 py-2 bg-[#FF6B35] text-white rounded-lg hover:brightness-110 font-bold"
        >
          Volver al inicio
        </button>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-[#F5F7FA] font-['Space_Grotesk'] text-[#2C3E50] antialiased">
      {/* Header con breadcrumb */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 md:px-10 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Volver"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-[#0A2463]">Historial de Simulaciones</h1>
              <p className="text-sm text-slate-500">Ver todas tus simulaciones de costos guardadas</p>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-10 py-12">
        <SimulationHistory userId={user.id} />
      </main>

      {/* Footer */}
      <footer className="bg-[#0A2463] text-white/70 py-16 px-10 mt-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-4 text-[#FF6B35] opacity-90">
            <div className="w-8 h-8">
              <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path d="M36.7273 44C33.9891 44 31.6043 39.8386 30.3636 33.69C29.123 39.8386 26.7382 44 24 44C21.2618 44 18.877 39.8386 17.6364 33.69C16.3957 39.8386 14.0109 44 11.2727 44C7.25611 44 4 35.0457 4 24C4 12.9543 7.25611 4 11.2727 4C14.0109 4 16.3957 8.16144 17.6364 14.31C18.877 8.16144 21.2618 4 24 4C26.7382 4 29.123 8.16144 30.3636 14.31C31.6043 8.16144 33.9891 4 36.7273 4C40.7439 4 44 12.9543 44 24C44 35.0457 40.7439 44 36.7273 44Z" fill="currentColor"></path>
              </svg>
            </div>
            <h2 className="text-lg font-bold tracking-tight text-white uppercase">MotorMatch Engine</h2>
          </div>
          <p className="text-[10px] text-white/40 max-w-xs text-center md:text-right">
            © 2024 MotorMatch Technical Engine. Todas las especificaciones están sujetas a cambios sin previo aviso según el fabricante.
          </p>
        </div>
      </footer>
    </div>
  );
}
