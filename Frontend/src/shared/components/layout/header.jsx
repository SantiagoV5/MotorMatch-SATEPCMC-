import { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import useAuth from '../../../features/auth/hooks/useAuth'

const PRIMARY_LINKS = [
  { to: '/', label: 'Inicio' },
  { to: '/comparar', label: 'Comparar' },
  { to: '/tendencias', label: 'Tendencias' },
  { to: '/nosotros', label: 'Nosotros' },
  { to: '/contacto', label: 'Contacto' },
  { to: '/ayuda', label: 'Ayuda' },
  { to: '/ai-chat', label: 'MIA', icon: 'smart_toy' },
]

function isLinkActive(pathname, to) {
  if (to === '/') return pathname === '/' || pathname === '/catalogo'
  return pathname === to || pathname.startsWith(`${to}/`)
}

export default function Header({ children, sticky = true }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, isAuthenticated, logout } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const displayName = useMemo(
    () => user?.name || user?.fullName || 'Explorador',
    [user],
  )

  const userMenu = useMemo(() => {
    const baseMenu = [
      { to: '/profile', label: 'Mi perfil', icon: 'person' },
      { to: '/profile', label: 'Configuración', icon: 'settings' },
      { to: '/favorites', label: 'Motos favoritas', icon: 'favorite' },
      { to: '/comparison-history', label: 'Historial de comparaciones', icon: 'history' },
      { to: '/simulations-history', label: 'Historial de simulaciones', icon: 'calculate' },
      { to: '/market-analysis', label: 'Análisis de mercado', icon: 'show_chart' },
      { to: '/market-trends', label: 'Tendencias de mercado', icon: 'trending_up' },
      { to: '/ayuda', label: 'Ayuda y FAQ', icon: 'help_center' },
    ]

    if (user?.isAdmin) {
      baseMenu.splice(2, 0, { to: '/admin/login', label: 'Panel de administrador', icon: 'admin_panel_settings' })
    }

    return baseMenu
  }, [user])

  const positionClass = sticky ? 'fixed top-0 left-0 z-30 w-full' : 'sticky top-0 z-30 w-full'

  return (
    <header className={`${positionClass} border-b border-slate-200 bg-white/95 px-4 py-3 shadow-sm backdrop-blur-sm md:px-6`}>
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-left"
            >
              <div className="text-primary">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 48 48">
                  <path d="M36.7273 44C33.9891 44 31.6043 39.8386 30.3636 33.69C29.123 39.8386 26.7382 44 24 44C21.2618 44 18.877 39.8386 17.6364 33.69C16.3957 39.8386 14.0109 44 11.2727 44C7.25611 44 4 35.0457 4 24C4 12.9543 7.25611 4 11.2727 4C14.0109 4 16.3957 8.16144 17.6364 14.31C18.877 8.16144 21.2618 4 24 4C26.7382 4 29.123 8.16144 30.3636 14.31C31.6043 8.16144 33.9891 4 36.7273 4C40.7439 4 44 12.9543 44 24C44 35.0457 40.7439 44 36.7273 44Z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-primary">MotorMatch</h1>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                  {isAuthenticated ? `Hola, ${displayName}` : 'Explora sin fricción'}
                </p>
              </div>
            </button>

            <div className="flex items-center gap-2 xl:hidden">
              {!isAuthenticated && (
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="rounded-full border border-slate-200 px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-slate-600"
                >
                  Entrar
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsMenuOpen((value) => !value)}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/5 text-primary"
                aria-label="Abrir navegación"
              >
                <span className="material-symbols-outlined">{isMenuOpen ? 'close' : 'menu'}</span>
              </button>
            </div>
          </div>

          <div className={`${isMenuOpen ? 'flex' : 'hidden'} flex-col gap-4 xl:flex xl:flex-1 xl:flex-row xl:items-center xl:justify-between`}>
            <nav className="flex flex-col gap-2 xl:ml-8 xl:flex-row xl:flex-wrap xl:items-center xl:gap-2">
              {PRIMARY_LINKS.map((link) => {
                const active = isLinkActive(location.pathname, link.to)
                const isAIChat = link.to === '/ai-chat'

                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition ${
                      isAIChat
                        ? active
                          ? 'bg-[#e85d26] text-white shadow-sm'
                          : 'bg-[#e85d26] text-white hover:brightness-110'
                        : active
                          ? 'bg-primary text-white shadow-sm'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-primary'
                    }`}
                  >
                    {link.icon && (
                      <span className="material-symbols-outlined text-[18px]">
                        {link.icon}
                      </span>
                    )}
                    {link.label}
                  </Link>
                )
              })}
            </nav>

            <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
              {!isAuthenticated ? (
                <div className="hidden items-center gap-3 xl:flex">
                  <button
                    type="button"
                    onClick={() => navigate('/login')}
                    className="rounded-full border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 transition hover:border-primary/20 hover:text-primary"
                  >
                    Iniciar sesión
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/register')}
                    className="rounded-full bg-[#FF6B35] px-4 py-2 text-sm font-black text-white transition hover:brightness-110"
                  >
                    Registrarse
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsMenuOpen((value) => !value)}
                    className="hidden items-center gap-3 rounded-full border border-slate-200 bg-white px-3 py-2 shadow-sm xl:flex"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/5 text-primary">
                      <span className="material-symbols-outlined">account_circle</span>
                    </span>
                    <span className="max-w-[180px] truncate text-sm font-bold text-slate-700">{displayName}</span>
                    <span className="material-symbols-outlined text-slate-400">expand_more</span>
                  </button>

                  <div className={`${isMenuOpen ? 'block' : 'hidden'} xl:absolute xl:right-0 xl:top-full xl:mt-3 xl:w-80`}>
                    <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-[0_20px_60px_rgba(15,23,42,0.12)]">
                      <div className="mb-3 rounded-2xl bg-primary/5 px-4 py-3">
                        <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">Tu cuenta</p>
                        <p className="mt-1 text-base font-black text-primary">{displayName}</p>
                      </div>

                      <div className="space-y-1">
                        {userMenu.map((item) => (
                          <button
                            key={item.label}
                            type="button"
                            onClick={() => {
                              setIsMenuOpen(false)
                              navigate(item.to)
                            }}
                            className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-primary"
                          >
                            <span className="material-symbols-outlined text-lg">{item.icon}</span>
                            <span>{item.label}</span>
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => {
                            setIsMenuOpen(false)
                            logout()
                            navigate('/')
                          }}
                          className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-semibold text-slate-600 transition hover:bg-red-50 hover:text-red-500"
                        >
                          <span className="material-symbols-outlined text-lg">logout</span>
                          <span>Cerrar sesión</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {children && <div className="mt-3">{children}</div>}
      </div>
    </header>
  )
}