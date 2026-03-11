/**
 * AuthSidePanel
 * Panel izquierdo compartido entre Login y Registro.
 * Props:
 *   description {string} - texto descriptivo que cambia en cada vista.
 */
function AuthSidePanel({ description }) {
  return (
    <div className="hidden lg:flex w-1/2 relative flex-col justify-between p-12 text-white overflow-hidden bg-primary">
      {/* Imagen de fondo */}
      <div className="absolute inset-0 z-0">
        <img
          alt="Motocicleta en carretera abierta"
          className="w-full h-full object-cover opacity-60"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuB4OkUM0CEcwPjlXq1333W0s4KYr8hQwPfhydGrf-JFL--HyM3mHPQMW8NBh39o8UxWDKw9TSkUFy7xrrk42_eMLEdrhtFwtVpWTdUvUlx4S0AfIBhifrR-nfgDxR9rPdk_6Ku1AMLt1earHV933nwWwF81NzzYd__gGwJ2hZaPrp3xHosQM3_GbJ2_auJV5EsMK6la-OGssX2zMmshRT9qaDPBKTVc5baYHBvwmp0B8LYzSGbEg4KVKlbVn1yi8eiXJjjQTYq2xBc"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/40 to-transparent" />
      </div>

      {/* Logo */}
      <div className="relative z-10 flex items-center gap-3">
        <div className="size-8 bg-white rounded-lg flex items-center justify-center text-primary">
          <span className="material-symbols-outlined">motorcycle</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight">MotorMatch</h2>
      </div>

      {/* Headline */}
      <div className="relative z-10">
        <h1 className="text-5xl font-black leading-tight mb-6">
          Tu próxima aventura comienza aquí.
        </h1>
        <p className="text-lg opacity-90 max-w-md">{description}</p>
      </div>

      {/* Hashtags */}
      <div className="relative z-10 flex gap-4 text-sm font-medium">
        <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
          #RideSafe
        </span>
        <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
          #MotorLife
        </span>
      </div>
    </div>
  )
}

export default AuthSidePanel
