function formatCOP(value) {
  if (value === null || value === undefined || value === '') return 'Consultar'

  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(Number(value))
}

function getAppUrl() {
  return import.meta.env.VITE_APP_URL || window.location.origin
}

function encodeWhatsAppMessage(message) {
  return encodeURIComponent(message.trim())
}

function buildWhatsAppLink(message) {
  return `https://wa.me/?text=${encodeWhatsAppMessage(message)}`
}

function openWhatsAppShare(message) {
  window.open(buildWhatsAppLink(message), '_blank', 'noopener,noreferrer')
}

export { formatCOP, getAppUrl, buildWhatsAppLink, openWhatsAppShare }