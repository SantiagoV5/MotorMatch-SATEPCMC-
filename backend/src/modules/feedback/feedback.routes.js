const { Router } = require('express')
const { requireAuth } = require('../../middlewares/auth.middleware')
const { validate } = require('../../middlewares/validation.middleware')
const { createFeedbackSchema, feedbackQuerySchema } = require('./feedback.validation')
const { getMyFeedback, createFeedback, getFeedbackStats } = require('./feedback.controller')

const router = Router()

router.get('/my', requireAuth, validate(feedbackQuerySchema, 'query'), getMyFeedback)
router.post('/', requireAuth, validate(createFeedbackSchema), createFeedback)
router.get('/stats', requireAuth, getFeedbackStats)

module.exports = router