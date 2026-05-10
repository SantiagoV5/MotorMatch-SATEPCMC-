import { useNavigate } from 'react-router-dom'

export default function AuthRequiredModal({
  isOpen,
  onClose,
  title = 'Debes iniciar sesión o registrarte para usar esta función.',
  description = 'Puedes seguir explorando el catálogo libremente y volver a intentarlo cuando quieras.',
}) {
  const navigate = useNavigate()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-slate-100 bg-white p-7 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FF6B35]/10 text-[#FF6B35]">
              <span className="material-symbols-outlined">lock</span>
            </div>
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.28em] text-slate-400">MotorMatch</p>
              <h3 className="mt-2 text-xl font-black leading-tight text-[#0A2463]">{title}</h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="text-slate-400 transition-colors hover:text-slate-600"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <p className="mt-4 text-sm leading-6 text-slate-600">{description}</p>

        <div className="mt-6 flex flex-col gap-3">
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="w-full rounded-2xl bg-[#0A2463] px-4 py-3 text-sm font-black uppercase tracking-[0.18em] text-white transition hover:brightness-110"
          >
            Iniciar sesión
          </button>
          <button
            type="button"
            onClick={() => navigate('/register')}
            className="w-full rounded-2xl border border-[#FF6B35]/20 bg-[#FF6B35]/10 px-4 py-3 text-sm font-black uppercase tracking-[0.18em] text-[#FF6B35] transition hover:bg-[#FF6B35]/15"
          >
            Registrarse
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
          >
            Continuar explorando
          </button>
        </div>
      </div>
    </div>
  )
}
