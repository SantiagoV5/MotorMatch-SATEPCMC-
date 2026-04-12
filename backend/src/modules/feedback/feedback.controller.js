const feedbackService = require('./feedback.service')

async function getMyFeedback(req, res, next) {
  try {
    const questionnaireId = Number(req.query.questionnaireId)
    const feedback = await feedbackService.getMyFeedback(req.user.id, questionnaireId)
    res.json({ success: true, data: feedback })
  } catch (err) {
    next(err)
  }
}

async function createFeedback(req, res, next) {
  try {
    const feedback = await feedbackService.createFeedback(req.user.id, req.body)
    res.status(201).json({ success: true, message: '¡Gracias por tu feedback! Nos ayuda a mejorar.', data: feedback })
  } catch (err) {
    next(err)
  }
}

async function getFeedbackStats(req, res, next) {
  try {
    const stats = await feedbackService.getFeedbackStats()
    res.json({ success: true, data: stats })
  } catch (err) {
    next(err)
  }
}

module.exports = { getMyFeedback, createFeedback, getFeedbackStats }