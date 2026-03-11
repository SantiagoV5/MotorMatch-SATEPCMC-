import { useNavigate } from 'react-router-dom'

export default function RecommendationList() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F5F7FA] px-4">
      <div className="flex flex-col items-center gap-6 text-center max-w-md">
        <span className="material-symbols-outlined text-7xl text-[#FF6B35]">construction</span>
        <h1 className="text-3xl font-black text-[#1E2A3A]">En Desarrollo</h1>
        <p className="text-slate-500 text-base">
          La página de recomendaciones está siendo construida. <br />
          Muy pronto podrás ver los resultados de tu cuestionario aquí.
        </p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 px-8 py-3 rounded-xl bg-[#FF6B35] text-white font-bold hover:bg-[#e55a25] transition-all"
        >
          Volver al inicio
        </button>
      </div>
    </div>
  )
}
