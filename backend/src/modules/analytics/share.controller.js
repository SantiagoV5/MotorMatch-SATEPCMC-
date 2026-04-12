const { recordShareEvent } = require('./share.service')

async function trackShare(req, res, next) {
  try {
    const { source, itemCount, messageLength } = req.body || {}

    if (!source) {
      return res.status(400).json({ message: 'source es obligatorio' })
    }

    await recordShareEvent(req.user.id, {
      source,
      itemCount: Number.isFinite(Number(itemCount)) ? Number(itemCount) : null,
      messageLength: Number.isFinite(Number(messageLength)) ? Number(messageLength) : null,
    })

    return res.status(201).json({ success: true })
  } catch (err) {
    next(err)
  }
}

module.exports = { trackShare }