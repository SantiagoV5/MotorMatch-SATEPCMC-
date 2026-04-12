import { useEffect, useMemo, useState } from 'react'
import { openWhatsAppShare } from '../utils/whatsappShare'

export default function ShareWhatsAppModal({
  isOpen,
  title,
  description,
  initialMessage,
  onClose,
  onSend,
}) {
  const [message, setMessage] = useState(initialMessage)

  useEffect(() => {
    if (isOpen) setMessage(initialMessage)
  }, [isOpen, initialMessage])

  const previewLength = useMemo(() => message.trim().length, [message])

  if (!isOpen) return null

  const handleSend = () => {
    onSend?.(message)
    openWhatsAppShare(message)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-100 overflow-hidden">
        <div className="flex items-start justify-between gap-4 p-6 border-b border-slate-100">
          <div>
            <h3 className="text-xl font-black text-primary">{title}</h3>
            <p className="mt-1 text-sm text-slate-500">{description}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
            aria-label="Cerrar"
          >
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
        </div>

        <div className="p-6">
          <label className="block text-sm font-bold text-slate-700 mb-2">Mensaje editable</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={14}
            className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          <p className="mt-2 text-xs text-slate-400">{previewLength} caracteres</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 p-6 border-t border-slate-100 bg-slate-50/70">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSend}
            className="flex-1 rounded-xl bg-[#25D366] px-5 py-3 text-sm font-black text-white shadow-lg shadow-[#25D366]/20 hover:brightness-95 transition-colors"
          >
            Enviar por WhatsApp
          </button>
        </div>
      </div>
    </div>
  )
}