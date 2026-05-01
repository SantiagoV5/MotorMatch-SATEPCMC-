const supportService = require('./support.service')

async function createSupportMessage(req, res, next) {
  try {
    const data = await supportService.createSupportMessage(req.body)
    res.status(201).json({
      success: true,
      message: 'Tu mensaje fue enviado. Volviendo a MotorMatch...',
      data,
    })
  } catch (err) {
    next(err)
  }
}

module.exports = { createSupportMessage }