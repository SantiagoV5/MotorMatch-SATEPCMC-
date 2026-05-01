import { useEffect, useState } from 'react'

export default function MotorcycleImage({
  src,
  alt,
  className = '',
  fallbackLabel = 'Imagen no disponible',
  fallbackIcon = 'two_wheeler',
  loading = 'lazy',
  decoding = 'async',
  zoom = 1,
  style: imgStyle,
  ...imgProps
}) {
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    setHasError(false)
  }, [src])

  if (!src || hasError) {
    return (
      <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400 ${className}`}>
        <div className="flex flex-col items-center gap-2 px-4 text-center">
          <span className="material-symbols-outlined text-5xl">{fallbackIcon}</span>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{fallbackLabel}</span>
        </div>
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading={loading}
      decoding={decoding}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      style={{
        ...imgStyle,
        transform: [imgStyle?.transform, zoom !== 1 ? `scale(${zoom})` : null].filter(Boolean).join(' ') || undefined,
        transformOrigin: 'center center',
        objectPosition: 'center center',
      }}
      {...imgProps}
    />
  )
}