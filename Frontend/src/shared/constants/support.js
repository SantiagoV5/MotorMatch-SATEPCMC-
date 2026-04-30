export const SUPPORT_EMAIL = 'soportemotormatch@gmail.com'
export const SUPPORT_SUBJECT = 'Ayuda MotorMatch'

export function getSupportMailto(subject = SUPPORT_SUBJECT) {
  return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}`
}

export const SUPPORT_MAILTO = getSupportMailto()
