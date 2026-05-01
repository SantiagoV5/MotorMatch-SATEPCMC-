const { sendSupportEmail } = require('../../utils/mailer')

async function createSupportMessage(payload) {
  const name = payload.name.trim()
  const email = payload.email.trim().toLowerCase()
  const message = payload.message.trim()
  const sourcePage = payload.sourcePage?.trim() || null

  await sendSupportEmail({
    name,
    email,
    message,
    sourcePage,
  })

  return { name, email, sourcePage }
}

module.exports = { createSupportMessage }