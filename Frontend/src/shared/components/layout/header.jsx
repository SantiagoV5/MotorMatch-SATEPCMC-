import { useNavigate } from 'react-router-dom';
import useAuth from '../../../features/auth/hooks/useAuth';

/**
 * Header compartido de MotorMatch.
 *
 * Props:
 *  - children : contenido extra que se inserta DEBAJO de la fila logo/usuario
 *               (usado por HomePage para la barra de búsqueda).
 *  - sticky   : (bool, default true) controla si el header es fixed o sticky.
 */
export default function Header({ children, sticky = true }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const displayName = user?.name || user?.fullName || 'Usuario';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const positionClass = sticky
    ? 'fixed top-0 left-0 z-30 w-full'
    : 'sticky top-0 z-30 w-full';

  return (
    <header
      className={`${positionClass} bg-white/95 backdrop-blur-sm border-b border-slate-200 px-4 md:px-6 py-3 shadow-sm`}
    >
      <div className="max-w-7xl mx-auto">
        {/* ── Fila principal: logo + usuario ── */}
        <div className={`flex items-center justify-between gap-4 ${children ? 'mb-0' : ''}`}>

          {/* Logo + botón Comparar */}
          <div className="flex items-center gap-3">
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => navigate('/')}
            >
              <div className="text-primary">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 48 48">
                  <path d="M36.7273 44C33.9891 44 31.6043 39.8386 30.3636 33.69C29.123 39.8386 26.7382 44 24 44C21.2618 44 18.877 39.8386 17.6364 33.69C16.3957 39.8386 14.0109 44 11.2727 44C7.25611 44 4 35.0457 4 24C4 12.9543 7.25611 4 11.2727 4C14.0109 4 16.3957 8.16144 17.6364 14.31C18.877 8.16144 21.2618 4 24 4C26.7382 4 29.123 8.16144 30.3636 14.31C31.6043 8.16144 33.9891 4 36.7273 4C40.7439 4 44 12.9543 44 24C44 35.0457 40.7439 44 36.7273 44Z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold tracking-tight text-primary">MotorMatch</h1>
            </div>
            {user && (
              <span className="hidden lg:inline-flex items-center rounded-full border border-primary/10 bg-primary/5 px-3 py-1 text-sm font-semibold text-primary max-w-[240px] truncate">
                ¡Hola, {displayName}!
              </span>
            )}
            <button
              onClick={() => navigate('/comparison')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-all shadow-sm hover:opacity-90 active:scale-95"
              style={{ backgroundColor: '#FF6B35' }}
            >
              <span className="material-symbols-outlined text-base">compare_arrows</span>
              <span className="hidden sm:inline">Comparar</span>
            </button>
            <button
              onClick={() => navigate('/ai-chat')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border border-primary/20 bg-primary/5 text-primary hover:bg-primary hover:text-white active:scale-95"
            >
              <span className="material-symbols-outlined text-base">smart_toy</span>
              <span className="hidden sm:inline">Concierge IA</span>
            </button>
            <button
              onClick={() => navigate('/market-trends')}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border border-slate-200 bg-white text-slate-700 hover:border-primary/30 hover:text-primary hover:bg-slate-50 active:scale-95"
            >
              <span className="material-symbols-outlined text-base">trending_up</span>
              <span>Tendencias</span>
            </button>
            <button
              onClick={() => navigate('/ayuda-faq')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border border-slate-200 bg-white text-slate-700 hover:border-primary/30 hover:text-primary hover:bg-slate-50 active:scale-95"
            >
              <span className="material-symbols-outlined text-base">help_center</span>
              <span>Ayuda</span>
            </button>
          </div>

          {/* Lado derecho: saludo + menú desplegable */}
          <div className="relative group flex items-center gap-4">
            {/* Botón trigger */}
            <button
              aria-label="Abrir menú de usuario"
              className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/5 hover:bg-primary/10 transition-colors duration-200 active:scale-95"
            >
              <span className="material-symbols-outlined text-primary">account_circle</span>
            </button>

            {/* Dropdown */}
            <div className="absolute right-0 top-full mt-2 w-72 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top-right z-[60]">
              <div
                className="bg-white rounded-xl p-4 border border-slate-100"
                style={{ boxShadow: '0px 4px 24px rgba(25,28,30,0.06)' }}
              >
                <div className="mb-4 pb-4 border-b border-slate-50">
                  <p className="text-primary font-bold font-headline">
                    {displayName}
                  </p>
                </div>
                <ul className="space-y-1">
                  <li>
                    <button
                      onClick={() => navigate('/ai-chat')}
                      className="w-full flex items-center gap-3 p-3 rounded-lg text-on-surface-variant hover:text-accent hover:bg-surface transition-all duration-300"
                    >
                      <span className="material-symbols-outlined text-lg">smart_toy</span>
                      <span className="text-sm font-semibold font-label">Concierge IA</span>
                    </button>
                  </li>
                  <li>
                    <button type="button" onClick={() => navigate('/profile')} className="w-full flex items-center gap-3 p-3 rounded-lg text-on-surface-variant hover:text-accent hover:bg-surface transition-all duration-300">
                      <span className="material-symbols-outlined text-lg">person</span>
                      <span className="text-sm font-semibold font-label">Mi perfil</span>
                    </button>
                  </li>
                  <li>
                    <a href="#" className="flex items-center gap-3 p-3 rounded-lg text-on-surface-variant hover:text-accent hover:bg-surface transition-all duration-300">
                      <span className="material-symbols-outlined text-lg">settings</span>
                      <span className="text-sm font-semibold font-label">Configuración</span>
                    </a>
                  </li>
                  <li>
                    <button
                      onClick={() => navigate('/favorites')}
                      className="w-full flex items-center gap-3 p-3 rounded-lg text-on-surface-variant hover:text-accent hover:bg-surface transition-all duration-300"
                    >
                      <span className="material-symbols-outlined text-lg">favorite</span>
                      <span className="text-sm font-semibold font-label">Motos favoritas</span>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => navigate('/comparison-history')}
                      className="w-full flex items-center gap-3 p-3 rounded-lg text-on-surface-variant hover:text-accent hover:bg-surface transition-all duration-300"
                    >
                      <span className="material-symbols-outlined text-lg">history</span>
                      <span className="text-sm font-semibold font-label">Historial de comparaciones</span>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => navigate('/simulations-history')}
                      className="w-full flex items-center gap-3 p-3 rounded-lg text-on-surface-variant hover:text-accent hover:bg-surface transition-all duration-300"
                    >
                      <span className="material-symbols-outlined text-lg">calculate</span>
                      <span className="text-sm font-semibold font-label">Historial de simulaciones</span>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => navigate('/market-analysis')}
                      className="w-full flex items-center gap-3 p-3 rounded-lg text-on-surface-variant hover:text-accent hover:bg-surface transition-all duration-300"
                    >
                      <span className="material-symbols-outlined text-lg">show_chart</span>
                      <span className="text-sm font-semibold font-label">Análisis de Mercado</span>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => navigate('/market-trends')}
                      className="w-full flex items-center gap-3 p-3 rounded-lg text-on-surface-variant hover:text-accent hover:bg-surface transition-all duration-300"
                    >
                      <span className="material-symbols-outlined text-lg">trending_up</span>
                      <span className="text-sm font-semibold font-label">Tendencias de Mercado</span>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => navigate('/ayuda-faq')}
                      className="w-full flex items-center gap-3 p-3 rounded-lg text-on-surface-variant hover:text-accent hover:bg-surface transition-all duration-300"
                    >
                      <span className="material-symbols-outlined text-lg">help_center</span>
                      <span className="text-sm font-semibold font-label">Ayuda y FAQ</span>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 p-3 rounded-lg text-on-surface-variant hover:text-error hover:bg-error/5 transition-all duration-300"
                    >
                      <span className="material-symbols-outlined text-lg">logout</span>
                      <span className="text-sm font-semibold font-label">Cerrar sesión</span>
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* ── Slot para contenido adicional (ej: barra de búsqueda en HomePage) ── */}
        {children && <div className="mt-3">{children}</div>}
      </div>
    </header>
  );
}
