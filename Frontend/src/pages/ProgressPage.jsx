import Header from '../shared/components/layout/header'

export default function ProgressPage() {
  return (
    <div className="min-h-screen bg-[#F7F9FC] text-slate-900">
      <Header sticky={false} />
      <main className="mx-auto max-w-5xl px-4 py-10 md:px-6">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-[11px] font-black uppercase tracking-[0.3em] text-[#FF6B35]">MotorMatch</p>
          <h1 className="mt-3 text-4xl font-black text-[#0A2463]">Avances</h1>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            Ruta lista para conectar la interfaz existente de avances del proyecto. Se deja fuera de la navbar principal para no competir con el catálogo, pero accesible desde navegación secundaria.
          </p>
        </section>
      </main>
    </div>
  )
}
