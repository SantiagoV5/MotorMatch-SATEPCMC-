const { Router } = require('express')
const { requireAuth } = require('../../middlewares/auth.middleware')
const { validate } = require('../../middlewares/validation.middleware')
const { questionnaireSchema } = require('./questionnaire.validation')
const { submitQuestionnaire, getMyQuestionnaire, getMyRecommendations } = require('./questionnaire.controller')

const router = Router()

router.get('/my', requireAuth, getMyQuestionnaire)
router.get('/my/recommendations', requireAuth, getMyRecommendations)
router.post('/', requireAuth, validate(questionnaireSchema), submitQuestionnaire)

module.exports = router
