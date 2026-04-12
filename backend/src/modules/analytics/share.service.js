const prisma = require('../../config/database')

async function recordShareEvent(userId, { source, itemCount = null, messageLength = null }) {
  return prisma.shareEvent.create({
    data: {
      userId,
      source,
      itemCount,
      messageLength,
      channel: 'whatsapp',
    },
    select: { id: true, createdAt: true },
  })
}

module.exports = { recordShareEvent }